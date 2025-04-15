



For model

mkdir -p models && cd models

wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -O models/mistral-7b.gguf



desibewda@pop-os:~$ ollama list
NAME                   ID              SIZE      MODIFIED    
deepseek-coder:1.3b    3ddd2d3fc8d2    776 MB    6 weeks ago    
desibewda@pop-os:~$ 




pip install -r requirements.txt



# Run in the hardhat-node directory before test
cd /mnt/development/pop-dev-assistant/core_backend/hardhat-node

# Initialize a new npm project if package.json doesn't exist
npm init -y

# Install hardhat locally
npm install --save-dev hardhat

# Now try running the hardhat node again
npx hardhat node

