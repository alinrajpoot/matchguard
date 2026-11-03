from pathlib import Path
import sys

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:5173"
OUT = Path("/tmp/matchguard-ui")
OUT.mkdir(parents=True, exist_ok=True)

ROUTES = {
    "dashboard": "/dashboard",
    "documents": "/documents",
    "invoices": "/invoices",
    "runs": "/runs",
    "queue": "/queue",
    "policies": "/policies",
    "audit": "/audit",
    "notifications": "/notifications",
    "settings": "/settings",
}

errors: list[str] = []

def main() -> int:
    with sync_playwright() as p:
        executable = "/usr/bin/google-chrome"
        browser = p.chromium.launch(
            executable_path=executable if Path(executable).exists() else None,
            headless=True,
            args=["--no-sandbox"],
        )
        for width, height in [(1440, 1000), (1024, 900), (768, 900)]:
            page = browser.new_page(viewport={"width": width, "height": height})
            page.on("console", lambda msg: errors.append(f"{msg.type}: {msg.text}") if msg.type == "error" else None)
            page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))

            page.goto(f"{BASE}/login")
            page.get_by_role("button", name="Sign in", exact=True).click()
            page.wait_for_url("**/dashboard")
            page.wait_for_selector("text=Matches processed")

            for name, path in ROUTES.items():
                page.goto(f"{BASE}{path}")
                page.wait_for_timeout(450)
                page.screenshot(path=str(OUT / f"{name}-{width}.png"), full_page=True)

            if width == 1440:
                page.goto(f"{BASE}/documents")
                page.get_by_role("button", name="Load sample batch").click()
                page.wait_for_selector("text=PO-70425.pdf", timeout=5000)

                page.goto(f"{BASE}/invoices")
                page.get_by_title("Run three-way match").first.click()
                page.wait_for_url("**/runs")
                page.wait_for_timeout(800)
                page.screenshot(path=str(OUT / "after-run.png"), full_page=True)

                page.goto(f"{BASE}/queue")
                page.get_by_role("link", name="Review", exact=True).first.click()
                page.wait_for_selector("text=Line comparison")
                page.get_by_label("Reason for decision").fill("Vendor amendment on file for this price increase.")
                page.get_by_role("button", name="Approve & Release").click()
                page.wait_for_url("**/queue")

                page.goto(f"{BASE}/policies")
                page.get_by_label("Quantity tolerance").fill("2")
                page.get_by_role("button", name="Publish policy").click()
                page.wait_for_selector("text=v14")

                page.get_by_role("button", name="Assistant").click()
                page.get_by_label("Message the assistant").fill("Show pipeline health")
                page.get_by_label("Message the assistant").press("Enter")
                page.wait_for_selector("text=get_pipeline_health", timeout=5000)

                page.goto(f"{BASE}/dashboard")
                page.get_by_label("Global search").fill("HS-88421")
                page.get_by_text("HS-88421", exact=True).first.click()
                page.wait_for_url("**/invoices**")

            page.close()
        browser.close()

    if errors:
        print("CONSOLE ERRORS:")
        print("\n".join(errors))
        return 1
    print(f"OK: screenshots written to {OUT}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
