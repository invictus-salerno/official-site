"""Import only public post embeds from an explicit, verified list of post URLs.

No account cookies, credentials or private Instagram endpoints are used.
HTML is parsed as data, never executed. Scratch HTML can be deleted after import.
"""
import argparse
import hashlib
import json
import re
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen
from PIL import Image


class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = False
        self.payloads = []
        self.image_url = None
        self.media_id = None
        self.media_type = None
        self.owner = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "data-media-type" in attributes:
            self.media_type = attributes["data-media-type"]
            self.media_id = attributes.get("data-media-id")
        if tag == "img" and attributes.get("class") == "EmbeddedMediaImage":
            self.image_url = attributes.get("src")
        if tag == "a" and any(token in attributes.get("class", "").split() for token in ("Avatar", "CollabUsername")):
            self.owner = urlparse(attributes.get("href", "")).path.strip("/")
        if tag == "script":
            self.active = True

    def handle_endtag(self, tag):
        if tag == "script":
            self.active = False

    def handle_data(self, data):
        if self.active:
            self.payloads.append(data)


def walk(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)
    elif isinstance(value, str) and "shortcode_media" in value:
        try:
            yield from walk(json.loads(value))
        except ValueError:
            pass


def decode_posts(html):
    parser = Scripts()
    parser.feed(html)
    found = {}
    for payload in parser.payloads:
        try:
            value = json.loads(payload)
        except ValueError:
            if "s.handle(" not in payload:
                continue
            try:
                value, _ = json.JSONDecoder().raw_decode(payload.split("s.handle(", 1)[1])
            except ValueError:
                continue
        nodes = list(walk(value))
        blocked = {node["context"]["shortcode"] for node in nodes if isinstance(node.get("context"), dict) and node["context"].get("copyright_blocked") and node["context"].get("shortcode")}
        for node in nodes:
            media = node.get("shortcode_media")
            if isinstance(media, dict) and media.get("shortcode"):
                media["copyrightBlocked"] = media["shortcode"] in blocked
                found[media["shortcode"]] = media
    if not found and parser.media_type == "GraphImage" and parser.image_url and parser.media_id:
        # Single-photo embeds expose their image in HTML instead of gql_data.
        match = re.search(r'data-permalink="https://www\.instagram\.com/p/([\w-]+)/', html)
        if match:
            code = match[1]
            found[code] = {"shortcode": code, "id": parser.media_id, "is_video": False, "display_url": parser.image_url, "owner": {"username": parser.owner}, "dimensions": {"width": 0, "height": 0}}
    return found


def fetch(url, limit):
    with urlopen(url, timeout=40) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ValueError("Media exceeds the import size limit")
    return data


def save_asset(url, stem, is_video):
    parsed = urlparse(url)
    if parsed.scheme != "https" or not (parsed.hostname or "").endswith(".cdninstagram.com"):
        raise ValueError("Unexpected public media origin")
    existing = list((Path("public/assets/instagram")).glob(f"{stem}.*"))
    data = existing[0].read_bytes() if existing else fetch(url, 60 * 1024 * 1024)
    if is_video and b"ftyp" in data[:32]:
        extension = "mp4"
    elif not is_video and data.startswith(b"\xff\xd8\xff"):
        extension = "jpg"
    elif not is_video and data.startswith(b"\x89PNG"):
        extension = "png"
    elif not is_video and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        extension = "webp"
    else:
        raise ValueError("Unexpected media format")
    relative = f"instagram/{stem}.{extension}"
    destination = Path("public/assets") / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    if not existing:
        destination.write_bytes(data)
    asset = {"src": relative, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    if not is_video:
        with Image.open(BytesIO(data)) as image:
            asset.update({"width": image.width, "height": image.height})
    return asset


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("posts", type=Path, help="Existing media manifest, or JSON array of verified public post URLs")
    cli.add_argument("--scratch", type=Path, default=Path(".instagram-import"))
    cli.add_argument("--since", default="2020-01-01")
    cli.add_argument("--profile-posts", type=int, required=True)
    cli.add_argument("--history-through", required=True, help="Oldest publication date verified by scrolling the public profile")
    cli.add_argument("--dates", type=Path, help="Publication dates verified in the public profile DOM (required for a URL array)")
    args = cli.parse_args()
    since = datetime.fromisoformat(args.since).replace(tzinfo=timezone.utc).timestamp()
    args.scratch.mkdir(parents=True, exist_ok=True)
    Path("public/assets/instagram").mkdir(parents=True, exist_ok=True)
    cache = {}
    source_manifest = json.loads(args.posts.read_text(encoding="utf-8-sig"))
    dates = json.loads(args.dates.read_text(encoding="utf-8-sig")) if args.dates else {post["shortcode"]: post["publishedAt"] for post in source_manifest["posts"]}
    for html in args.scratch.glob("*.html"):
        for code, post in decode_posts(html.read_text(encoding="utf-8-sig")).items():
            cache[code] = {**cache.get(code, {}), **post}

    def import_post(url):
        match = re.fullmatch(r"https://www\.instagram\.com/asdinvictus_salerno/(p|reel)/([\w-]+)/", url)
        if not match:
            raise ValueError("Expected a verified asdinvictus_salerno post URL")
        kind, code = match.groups()
        post = cache.get(code)
        if not post:
            html = fetch(f"https://www.instagram.com/{kind}/{code}/embed/", 4 * 1024 * 1024).decode()
            (args.scratch / f"{code}.html").write_text(html, encoding="utf-8")
            post = decode_posts(html).get(code)
        if not post:
            raise ValueError(f"Public post data unavailable: {code}")
        if post.get("owner", {}).get("username") != "asdinvictus_salerno":
            raise ValueError(f"Unexpected owner: {code}")
        timestamp = post.get("taken_at_timestamp")
        if not timestamp and code in dates:
            timestamp = datetime.fromisoformat(dates[code]).replace(tzinfo=timezone.utc).timestamp()
        if not timestamp:
            raise ValueError(f"Publication date unavailable: {code}")
        if timestamp < since:
            return None
        caption_edges = post.get("edge_media_to_caption", {}).get("edges", [])
        caption = caption_edges[0]["node"].get("text", "") if caption_edges else ""
        children = post.get("edge_sidecar_to_children", {}).get("edges", [{"node": post}])
        media = []
        for index, child in enumerate(children, 1):
            node = child["node"]
            is_video = node.get("is_video", False)
            source = node.get("video_url") if is_video else node.get("display_url")
            instagram_only = is_video and not source and post.get("copyrightBlocked")
            if instagram_only:
                source = node.get("display_url")
            if not source:
                raise ValueError(f"Missing native source: {code}/{index}")
            item = {"id": node["id"], "kind": "video" if is_video else "image", **node["dimensions"]}
            item.update(save_asset(source, f"{code}-{index:02d}", is_video and not instagram_only))
            if is_video:
                item["duration"] = node.get("video_duration")
                item["playback"] = "instagram" if instagram_only else "native"
                if instagram_only:
                    item["restriction"] = "Instagram public embed marks copyright_blocked=true; native source is not exposed."
                elif node.get("display_url"):
                    item["poster"] = save_asset(node["display_url"], f"{code}-{index:02d}-poster", False)
            media.append(item)
        print(f"Imported {code}: {len(media)} media", flush=True)
        published = datetime.fromtimestamp(post["taken_at_timestamp"], timezone.utc).isoformat() if post.get("taken_at_timestamp") else dates[code]
        return {"shortcode": code, "permalink": url, "publishedAt": published, "caption": caption, "media": media}

    source_urls = source_manifest if isinstance(source_manifest, list) else [post["permalink"] for post in source_manifest["posts"]]
    urls = list(dict.fromkeys(source_urls))
    posts, failures = [], []
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {url: executor.submit(import_post, url) for url in urls}
        for url, future in futures.items():
            try:
                post = future.result()
                if post:
                    posts.append(post)
            except Exception as error:
                failures.append({"url": url, "error": str(error)})
    posts.sort(key=lambda post: post["publishedAt"], reverse=True)
    complete = args.history_through < args.since and bool(posts) and not failures
    manifest = {"profile": "https://www.instagram.com/asdinvictus_salerno/", "from": args.since, "profilePostCount": args.profile_posts, "complete": complete, "historyVerifiedThrough": args.history_through, "coverage": "Public profile scrolled past the 2020 boundary; all individual album items included. Copyright-restricted videos retain their cover and original post link.", "posts": posts, "unavailable": failures}
    destination = Path("src/data/instagram-media.json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"posts": len(posts), "media": sum(len(p["media"]) for p in posts), "failures": failures}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
