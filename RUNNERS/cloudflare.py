import asyncio
import sys
from curl_cffi.requests import AsyncSession

async def fetch_data(url):
    async with AsyncSession() as s:
        r = await s.get(url)
        print(r.text)  # Print or process the response as needed

if __name__ == "__main__":
    # Check if a URL was provided
    if len(sys.argv) != 2:
        print("Usage: python3 main.py <URL>")
        sys.exit(1)

    # Get the URL from command-line arguments
    url = sys.argv[1]

    # Run the async function with the provided URL
    asyncio.run(fetch_data(url))