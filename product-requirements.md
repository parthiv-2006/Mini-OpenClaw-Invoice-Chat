1. The "Mini-Moltbot" Invoice Chat (Highly Recommended)
This directly tackles the GenLedge use-case of document extraction and Moltbot's conversational nature.

The Concept: A simple web app where a user drags and drops a PDF invoice or receipt. The app processes the document and provides a chat interface to ask questions about it (e.g., "What is the total tax?", "Who is the vendor?", "Are there any late fees mentioned?").

The Stack: Next.js (Frontend UI), Python/FastAPI (Backend), PyMuPDF (to read the PDF), LlamaIndex + Google Gemini (for the RAG pipeline).

Why it wins the interview: It proves you can build an end-to-end RAG system for financial documents.

How to build it fast: Have Cursor generate a standard Next.js drag-and-drop component and a chat UI. On the backend, use LlamaIndex's out-of-the-box VectorStoreIndex to chunk the PyMuPDF text and serve it to the LLM.


Phase 1: The Foundation & Drag-and-Drop (Hour 1)
The goal here is to get the basic skeleton up and running so you can upload a file and pass it to your backend.

Step 1: Scaffold the UI. Open Cursor and prompt it to generate a clean, modern drag-and-drop zone and a blank chat interface. You don't need to spend time writing CSS; just vibe code a simple container that accepts .pdf files.

Step 2: Setup the Backend Endpoint. Create a Python route in your Antigravity environment that accepts a multipart/form-data file upload.

Step 3: Connect them. Ensure that when a user drops a PDF, it successfully hits your backend and saves to a temporary directory or memory buffer.



Phase 2: The Parsing Engine (Hour 2)
This is where your Outamation experience kicks in. Financial documents are notoriously tricky, so reliable text extraction is key.

Step 1: Integrate PyMuPDF. Write a utility function that takes the uploaded PDF file and extracts all the text.

Step 2: Clean the Data. Invoices often have weird spacing or column breaks. Write a quick regex or cleaning script to strip out excessive whitespace or messy characters so the LLM gets clean data to read.

Step 3: Verification. Console log the extracted text to ensure your script is accurately pulling the line items, totals, and vendor names from your test invoices.



Phase 3: The RAG Pipeline (Hours 3-4)
This is the core of the project and the part Kulwant will ask about most during the interview. You are building the "brain" of the assistant.

Step 1: Initialize LlamaIndex. Pass your cleaned PyMuPDF text into LlamaIndex's Document object.

Step 2: Chunking & Embeddings. Set up your node parser. Since invoices are short, you can use slightly larger chunk sizes so the LLM doesn't lose the context of a table row. Connect this to Google Gemini's embedding model to convert the text into vectors.

Step 3: Create the Query Engine. Build the in-memory vector store and initialize the query engine using Gemini as the primary LLM.

Step 4: The System Prompt (Crucial!). Give the engine a strict system prompt. Tell it: "You are an autonomous accounting assistant. You only answer questions based on the provided invoice context. If the answer is not in the invoice, reply 'Information not found.' Do not hallucinate."



Phase 4: The Chat Interface (Hour 5)
Now you connect the brain back to the user interface to give it that "Moltbot" feel.

Step 1: The Chat Endpoint. Create a second backend endpoint that accepts a string (the user's question) and passes it to your LlamaIndex query engine.

Step 2: Wire the Frontend. Have Cursor generate the logic to capture the user's input from the chatbox, send it to the chat endpoint, and render the AI's response in the UI.

Step 3: State Management. Ensure the frontend keeps track of the conversation history so the user can ask follow-up questions (e.g., "What was the total?" followed by "Does that include tax?").



Phase 5: The GenLedge Polish (Hour 6)
This is where you make it an interview-winning portfolio piece.

Step 1: Edge-Case Testing. Download 3-4 different types of invoices (a restaurant receipt, a SaaS software bill, a messy contractor invoice). Run them all through the app and see where the AI fails.

Step 2: Error Handling. Add graceful UI states if the user uploads something that isn't a PDF, or if the PyMuPDF extraction fails because the PDF is an image (you can skip full OCR for tonight, just catch the error and tell the user).

Step 3: Document the "Why". Write a tight README.md. Explain why you chose PyMuPDF for extraction and how you configured LlamaIndex to prevent hallucinations. This README is what you will send to Kulwant.