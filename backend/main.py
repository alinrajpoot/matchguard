import uvicorn
from fastapi import FastAPI

app = FastAPI(title="matchguard-ap-rag")


@app.get("/")
def root():
    return {"message": "Hello from matchguard-ap-rag!"}


def main():
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    main()
