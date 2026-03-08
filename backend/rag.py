import os
from dotenv import load_dotenv
from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.gemini import GeminiEmbedding

# Load environment variables
load_dotenv()

# Pre-configure LlamaIndex settings to use Google Gemini
def configure_llama_index_settings():
    """
    Configures the global LlamaIndex settings to use Gemini for both 
    the LLM generation and Text Embeddings.
    """
    # Throw a clear error if the API key is missing
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
         raise ValueError("GOOGLE_API_KEY is not set in the .env file")
    
    # Configure the Gemini LLM (flash is fast and cheap for this)
    llm = Gemini(model="models/gemini-3.0-flash-exp", api_key=api_key)
    
    # Configure the Gemini Embedding model
    embed_model = GeminiEmbedding(model_name="models/text-embedding-004-exp", api_key=api_key)
    
    # Set the globals in Settings
    Settings.llm = llm
    Settings.embed_model = embed_model
    Settings.chunk_size = 512 # Keep it relatively large for invoice context
    Settings.chunk_overlap = 50

def build_query_engine(cleaned_text: str):
    """
    Takes cleaned text from a PDF, converts it to LlamaIndex Documents, 
    embeds them into a VectorStoreIndex using Gemini, and returns a QueryEngine.
    """
    print("--- Configuring LlamaIndex Settings ---")
    configure_llama_index_settings()
    
    print("--- Wrapping Text in LlamaIndex Document ---")
    # Wrap our text chunk in a LlamaIndex understanding format
    document = Document(text=cleaned_text)
    
    print("--- Building Vector Store Index ---")
    # This automatically splits the document using the chunk_size
    # and calls the Gemini Embedding API to turn chunks into vectors
    index = VectorStoreIndex.from_documents([document])
    
    print("--- Creating Query Engine ---")
    # Convert index into the active engine.
    query_engine = index.as_query_engine()
    
    # Phase 3, Step 4 requirement: Strict system prompt to prevent hallucination
    # We update the prompts of the query engine natively
    system_prompt = (
        "You are an autonomous accounting assistant. "
        "You only answer questions based on the provided invoice context. "
        "If the answer is not in the invoice text, reply exactly with: 'Information not found.' "
        "Do not hallucinate or make assumptions."
    )
    
    # Inject our prompt
    prompts_dict = query_engine.get_prompts()
    
    # We grab the standard text QA template and prepend our system prompt instructions
    if "response_synthesizer:text_qa_template" in prompts_dict:
        # Hack to update LlamaIndex default QA prompt
        current_prompt = prompts_dict["response_synthesizer:text_qa_template"]
        new_prompt_tmpl = f"{system_prompt}\n\nContext information is below.\n---------------------\n{{context_str}}\n---------------------\nGiven the context information and not prior knowledge, answer the query.\nQuery: {{query_str}}\nAnswer: "
        
        # In newer versions of LlamaIndex, recreating the prompt template class is the cleanest way
        from llama_index.core import PromptTemplate
        new_prompt = PromptTemplate(new_prompt_tmpl)
        query_engine.update_prompts({"response_synthesizer:text_qa_template": new_prompt})

    print("--- Engine Ready ---")
    return query_engine
