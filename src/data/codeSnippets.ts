export interface CodeSnippet {
    id: string;
    name: string;
    code: string;
    standardError: string;
}

export const codeSnippets: CodeSnippet[] = [
    {
        id: "snippetA",
        name: "unterminated_string_syntax_error.py",
        code: `import os
from datetime import datetime

class BookShelf:
    def __init__(self, log):
        self.log = log

    def preview(self):
        """
        Shows first two book titles, if any.
        """
        if not os.path.exists(self.log):
            return "No log found."
        with open(self.log) as f:
            lines = f.readlines()
        preview = "".join(lines[:2])
        return f"""Preview:\\n{preview}""

    def summary(self):
        """
        Gives a summary of the log.
        """
        total = count_books(self.log)
        return f"Books logged: {total}"

def add_book(log, title):
    """
    Adds a book entry with timestamp.
    """
    with open(log, 'a') as f:
        f.write(f"{datetime.now().isoformat()} - {title}\\n")

def count_books(log):
    """
    Counts books in the log.
    """
    if not os.path.exists(log):
        return 0
    with open(log) as f:
        return sum(1 for _ in f)`,
        standardError: `File "main.py", line 36
  """
  ^
SyntaxError: unterminated triple-quoted string literal (detected at line 40)`
    },
    {
        id: "snippetB",
        name: "name_error.py",
        code: `import random

class UserData:
    """Represents user data with a name and a list of scores."""

    def __init__(self, name, scores):
        self.name = name
        self.scores = scores
        self._normalize_scores()

    def _normalize_scores(self):
        total = sum(self.scores)
        self.scores = [round(s / total, 2) if total else 0 for s in self.scores]

    def top_score(self):
        """Returns the highest normalized score."""
        return maximum(self.scores)

    def add_score(self, score):
        self.scores.append(score)
        self._normalize_scores()


def summarize_scores(users):
    return {u.name: u.top_score() for u in users}


if __name__ == '__main__':
    """Main routine to generate user data, summarize scores, and print the results."""
    users = [UserData(f"user_{i + 1}", [random.randint(0, 100) for _ in range(random.randint(2, 5))]) for i in range(4)]
    summary = summarize_scores(users)
    for name, score in summary.items():
        print(f"{name}: {score:.2f}")`,
        standardError: `Traceback (most recent call last):
  File "main.py", line 31, in <module>
    summary = summarize_scores(users)
              ^^^^^^^^^^^^^^^^^^^^^^^
  File "main.py", line 25, in summarize_scores
    return {u.name: u.top_score() for u in users}
                    ^^^^^^^^^^^^^
  File "main.py", line 17, in top_score
    return maximum(self.scores)
           ^^^^^^^
NameError: name 'maximum' is not defined`
    },
    {
        id: "snippetC",
        name: "annotation_type_error.py",
        code: `import random

def generate_scores(n):
    """Generate n random test scores."""
    return [random.randint(0, 100) for _ in range(n)]

def average(scores):
    """Compute the average score."""
    if not scores:
        return 0
    return sum(scores) / len(scores)

def filter_passing(scores, threshold=60):
    """Return scores that are passing."""
    return [s for s in scores if s >= threshold]

class ScoreReport:
    def __init__(self, scores):
        self.scores = scores

    @classmethod @staticmethod
    def describe():
        """Describe the scoring system."""
        return "Scores range from 0 to 100."

    def passing_percentage(self):
        """Return the percentage of passing scores."""
        passing = filter_passing(self.scores)
        return 100 * len(passing) / len(self.scores) if self.scores else 0

    def report(self):
        """Return a formatted report."""
        avg = average(self.scores)
        pct = self.passing_percentage()
        desc = self.describe()
        return f"{desc}\\nAverage: {avg:.1f}\\nPassing: {pct:.1f}%"

def main():
    scores = generate_scores(12)
    report = ScoreReport(scores)
    print(report.report())

if __name__ == "__main__":
    main()`,
        standardError: `Traceback (most recent call last):
  File "main.py", line 17, in <module>
    class ScoreReport:
  File "main.py", line 21, in ScoreReport
    @classmethod @staticmethod
     ~~~~~~~~~~~~^~~~~~~~~~~~~
TypeError: unsupported operand type(s) for @: 'type' and 'type'`
    },
    {
        id: "snippetD",
        name: "subscriptable_syntax_error.py",
        code: `import math

def normalize(vec):
    norm = math.sqrt(sum(x ** 2 for x in vec))
    return [x / norm for x in vec] if norm else vec

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

def cosine(a, b):
    return dot(normalize(a), normalize(b))

def fixed_vectors():
    """Returns a fixed set of vectors for testing purposes."""
    return [
        [1.0, 2.0, 3.0],
        [2.0, 0.0, 1.0],
        [-1.0, 1.0, 0.0],
        [0.5, -2.0, 2.0]
    ]

def most_similar_pair(vectors):
    """Finds the most similar pair of vectors based on cosine similarity."""
    max_sim = -2
    pair = (0, 1)
    for i in range(len(vectors)):
        for j in range(i + 1, len(vectors)):
            sim = cosine(vectors[i], vectors[j])
            if sim > max_sim:
                max_sim = sim
                pair = (i, j)
    return pair

def main():
    vs = fixed_vectors()
    print("Most similar pair:", most_similar_pair(vs))
    for i in range(len(vs)):
        print("Vector", i, ":", vs.__getitem__[i])

if __name__ == "__main__":
    main()`,
        standardError: `Traceback (most recent call last):
  File "main.py", line 41, in <module>
    main()
  File "main.py", line 38, in main
    print("Vector", i, ":", vs.__getitem__[i])
                            ~~~~~~~~~~~~~~^^^
TypeError: 'builtin_function_or_method' object is not subscriptable`
    }
];

export const ollamaModels = [
    "llama3.2:3b",
    "llama3.1:8b",
    "deepseek-coder:6.7b",
    "qwen2.5-coder:7b",
];

export type ErrorMessageType = "pragmatic" | "contingent";

export const errorMessageTypes: ErrorMessageType[] = ["pragmatic", "contingent"];