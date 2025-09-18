from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import tempfile
import os
from typing import List

from combined import process_document_pipeline, detect_mime_type

MAX_FILE_BYTES = 25 * 1024 * 1024  # 25MB

def get_allowed_origins() -> List[str]:
    # DEV default
    origins = os.getenv("ALLOWED_ORIGINS")
    if origins:
        return [o.strip() for o in origins.split(",") if o.strip()]
    return ["http://localhost:3000"]


app = FastAPI(title="CouncellorX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process")
async def process(file: UploadFile = File(...)):
    # Validate mime by filename extension first
    try:
        _ = detect_mime_type(file.filename)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Save to temp with streaming and enforce size
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            bytes_read = 0
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                bytes_read += len(chunk)
                if bytes_read > MAX_FILE_BYTES:
                    raise HTTPException(status_code=413, detail="File too large. Max 25MB.")
                tmp.write(chunk)
            temp_path = tmp.name
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {exc}")
    finally:
        await file.close()

    # Run pipeline
    try:
        result = process_document_pipeline(temp_path)
        data = result.model_dump()
        return JSONResponse({"data": data})
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    finally:
        try:
            os.unlink(temp_path)
        except Exception:
            pass

