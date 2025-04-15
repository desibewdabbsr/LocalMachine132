import streamlit as st

from services.service_registry import ServiceRegistry
from components.layout_manager import LayoutManager
from components.progress_tracker import ProgressTracker
import sys

sys.path.append(".")
from src.core.ai_integration.deepseek_controller import DeepSeekController
from src.core.ai_integration.llama_controller import LlamaController

# Page config
st.set_page_config(page_title="AI Software Builder",
                   layout="wide",
                   initial_sidebar_state="collapsed")

from src.core.ai_detection import AIDetector

# Initialize AI detection
if 'ai_status' not in st.session_state:
    detector = AIDetector()
    st.session_state.ai_status = detector.get_ai_status()

# Show AI Status
with st.sidebar:
    st.markdown("### AI Status")
    st.write(f"Environment: {st.session_state.ai_status['environment']}")
    st.write(f"Mistral: {'✅' if st.session_state.ai_status['mistral'] else '❌'}")
    st.write(f"DeepSeek: {'✅' if st.session_state.ai_status['deepseek'] else '❌'}")

# Initialize AI controllers
if 'ai_controllers' not in st.session_state:
    st.session_state.ai_controllers = {
        'deepseek': DeepSeekController(),
        'mistral': LlamaController()
    }

# Initialize services and components
service_registry = ServiceRegistry()
layout_manager = LayoutManager()
progress_tracker = ProgressTracker()

# Custom CSS for VS Code-like interface
st.markdown("""
<style>
    .stApp {
        background-color: #1e1e1e;
        color: #d4d4d4;
    }
    .chat-container {
        background: #252526;
        border-radius: 8px;
        padding: 20px;
        margin: 10px 0;
        border: 1px solid #404040;
    }
    .chat-header {
        border-bottom: 1px solid #404040;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }
    .stChatMessage {
        background-color: #2d2d2d !important;
        border: 1px solid #404040 !important;
        padding: 15px !important;
        margin: 10px 0 !important;
    }
    .main-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }
    .top-bar {
        background: #2d2d2d;
        padding: 0.5rem;
        border-bottom: 1px solid #404040;
    }
    .workspace {
        display: flex;
        flex: 1;
    }
    .service-panel {
        background: #252526;
        padding: 1rem;
        margin: 0.5rem;
        border-radius: 4px;
        border: 1px solid #404040;
    }
    .status-bar {
        background: #007acc;
        color: white;
        padding: 0.2rem 1rem;
        font-size: 0.8rem;
    }
    .chat-container {
        background: #1e1e1e;
        border: 1px solid #404040;
        border-radius: 4px;
        padding: 1rem;
        margin-top: 1rem;
    }
    .stTextInput > div > div > input {
        background-color: #3c3c3c;
        color: #d4d4d4;
        border: 1px solid #404040;
    }
    .stButton > button {
        background-color: #0e639c;
        color: white;
        border: none;
    }
</style>
""", unsafe_allow_html=True)

# Main layout
cols = st.columns([2, 5])

# Left sidebar - Project Explorer
with cols[0]:
    st.markdown("### Project Explorer")
    progress_tracker.display()

    st.markdown("### Active Services")
    for service in service_registry.get_all_services():
        if service.is_active:
            st.markdown(f"- {service.name} ({service.status})")

# Main workspace
with cols[1]:
    st.markdown("### AI Development Workspace")

    # Chat interface
    from components.chat_interface import ChatInterface
    chat_interface = ChatInterface()

    with st.container():
        # Model selection in sidebar
        st.sidebar.selectbox("Select AI Model",
                         ["Auto", "DeepSeek 1.3b", "Mistral-7b"],
                         key="model_selection")

        # Display chat interface
        chat_interface.display()

    # Status bar
    st.markdown("""
    <div class='status-bar'>
        Ready
    </div>
    """, unsafe_allow_html=True)