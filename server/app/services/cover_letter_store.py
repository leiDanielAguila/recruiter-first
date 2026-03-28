from threading import Lock
from app.models.cover_letter import CoverLetterDocument


class InMemoryCoverLetterStore:
    def __init__(self) -> None:
        self._documents: dict[str, CoverLetterDocument] = {}
        self._lock = Lock()

    def save(self, document: CoverLetterDocument) -> None:
        with self._lock:
            self._documents[document.id] = document

    def get(self, document_id: str) -> CoverLetterDocument | None:
        with self._lock:
            return self._documents.get(document_id)


_store = InMemoryCoverLetterStore()


def get_cover_letter_store() -> InMemoryCoverLetterStore:
    """
    Return the active cover letter store implementation.

    Keep this indirection so cloud storage migration can swap this
    implementation without changing API handlers.
    """
    return _store
