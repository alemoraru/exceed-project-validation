# EXCEED Project Validation

This repository is designed for evaluating the effectiveness of prompt templates and language models in rephrasing error
messages for buggy code snippets. The web application allows users to select different models and prompt styles,
generate improved error messages, and provide feedback on their quality. All feedback is stored locally and can be
exported for further analysis.

---

## 🛠️ Requirements

- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed
- [Ollama](https://ollama.com/) installed and running locally
- Download the desired Ollama models on your machine before using the app (models must be available locally). More
  specifically, the following models are used for validation and need to be downloaded:
    - [`qwen2.5:7b`](https://ollama.com/library/qwen2.5:7b)
    - [`granite3.3:8b`](https://ollama.com/library/granite3.3:8b)
    - [`llama3.1:8b`](https://ollama.com/library/llama3.1:8b) (but this should not be used for validation, only for
      comparison purposes)

---

## ⚡ QuickStart

1. **Clone the repository:**

   ```sh
   git clone git@github.com:alemoraru/exceed-project-validation.git
   cd exceed-project-validation
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Start the development server:**

   ```sh
   npm run dev
   ```

   The app will be available at [http://localhost:8080](http://localhost:8080).

---

## 🚀 Usage

- Open the app in your browser at [http://localhost:8080](http://localhost:8080).
- Select a code snippet and choose a model and error message style.
- Click "Improve Error" to generate a rephrased error message using the selected model and prompt.
- Review the improved error message and submit feedback using the feedback form.
- Download all feedback as a CSV file for further analysis (it's stored locally in the browser's localstorage).

---

## 🧩 Tech Stack

- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Ollama](https://ollama.com/)

---

## 🤝 Contributing

This project was developed as part of the EXCEED MSc Thesis project at Technische Universiteit Delft. As such,
contributions of any sort will not be accepted. This repository is provided for replication and educational purposes
ONLY. Since it was used to orchestrate the deployment of our study on Prolific, it is NOT intended for further
development or contributions.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
