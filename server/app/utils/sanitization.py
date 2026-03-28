import re

MAX_WORDS = 1000
MAX_PDF_BYTES = 10 * 1024 * 1024  # 10 MB

_INJECTION_PATTERNS = [
    # URLs
    (re.compile(r'https?://', re.IGNORECASE), "URLs are not allowed in the job description."),
    (re.compile(r'\bwww\.[^\s]+', re.IGNORECASE), "URLs are not allowed in the job description."),
    # HTML tags
    (re.compile(r'<[a-z][^>]*>', re.IGNORECASE), "HTML tags are not allowed in the job description."),
    # SQL keywords in suspicious context
    (re.compile(r'\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|TRUNCATE)\b.*\b(FROM|INTO|TABLE|WHERE)\b', re.IGNORECASE), "SQL statements are not allowed in the job description."),
    # Prompt / system override injection
    (re.compile(r'\b(ignore|disregard|forget)\b.{0,30}\b(previous|prior|above|instructions|rules|prompt)\b', re.IGNORECASE), "Your input contains disallowed content. Please enter a plain job description."),
    (re.compile(r'(^|[\r\n])\s*(\[(SYSTEM|INST|SYS)\]|(SYSTEM|INST|SYS))\s*:', re.IGNORECASE), "Your input contains disallowed content. Please enter a plain job description."),
    (re.compile(r'\b(you are now|act as|pretend (you are|to be)|new persona)\b', re.IGNORECASE), "Your input contains disallowed content. Please enter a plain job description."),
]