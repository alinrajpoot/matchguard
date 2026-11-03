# import uvicorn
from docling.chunking import HybridChunker
from docling.document_converter import DocumentConverter
from fastapi import FastAPI

app = FastAPI(title="matchguard-ap-rag")


@app.get("/")
def root():
    return {"message": "Hello from matchguard-ap-rag!"}


def main():
    converter = DocumentConverter()
    chunker = HybridChunker(tokenizer="BAAI/bge-small-en-v1.5")

    result = converter.convert("../data/files/Goods Receipt Note LPS-2025-0417-A.pdf")

    # print(result.document.export_to_markdown())
    for chunk in chunker.chunk(result.document):
        print(f"\n\n-->\t\t{chunk.meta.headings}")  # section path
        print(chunk.text)
        # print(chunk.meta.doc_items)  # back-references into the document


# uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    main()
