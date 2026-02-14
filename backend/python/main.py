from fastapi import FastAPI, UploadFile, File
from PIL import Image
import torch
import timm
import torchvision.transforms as T
import io
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI()

# Allow requests from your React dev server
origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173",
    # You can add more origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allow requests only from these origins
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, etc.
    allow_headers=["*"],  # allow headers like Content-Type, Authorization
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

NUM_CLASSES = 4  # CHANGE THIS
CLASS_NAMES = ['Scab', 'Black Rot', 'Cedar Rust', 'Healthy']

model = timm.create_model(
    "efficientnet_b0",
    pretrained=False,
    num_classes=NUM_CLASSES
)

state = torch.load("model.pth", map_location=DEVICE)
model.load_state_dict(state)
model.to(DEVICE)
model.eval()

transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    x = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]

    idx = int(torch.argmax(probs))
    return {
        "class": CLASS_NAMES[idx],
        "confidence": float(probs[idx])
    }
