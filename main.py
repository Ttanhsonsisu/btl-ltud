from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import BertTokenizer, BertForSequenceClassification
import torch
from fastapi.middleware.cors import CORSMiddleware
import spacy
# Load pre-trained BERT model and tokenizer
MODEL_PATH = "./saved_model"  # Thay bằng đường dẫn đến mô hình của bạn
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
model = BertForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()  # Chuyển mô hình sang chế độ đánh giá

# Khởi tạo FastAPI app
app = FastAPI()

nlp = spacy.load("en_core_web_sm")

# Định nghĩa input schema
class TextRequest(BaseModel):
    text: str

# Định nghĩa output schema
class PredictionResponse(BaseModel):
    label: str
    confidence: float
    analysis: list

class DependencyResponse(BaseModel):
    nodes: list
    links: list
# hàm phân tích câu
# Hàm phân tích ngữ nghĩa
def analyze_sentence(text):
    doc = nlp(text)
    analysis = []

    for token in doc:
        analysis.append({
            "word": token.text,
            "lemma": token.lemma_,
            "pos": token.pos_,
            "dependency": token.dep_,
        })
    
    return analysis

# Hàm dự đoán
def predict(text: str):
    # Tokenize và encode văn bản
    inputs = tokenizer(
        text,
        add_special_tokens=True,
        max_length=64,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )

    # Dự đoán
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1).squeeze().tolist()
        predicted_label = torch.argmax(logits, dim=1).item()

    # Chuyển đổi nhãn số thành nhãn văn bản (tùy thuộc vào bài toán của bạn)
    label_map = {0: "Negative", 1: "Positive", 2: "Neutral", 3: "Irrelevant" }  # Ví dụ: 0 là Negative, 1 là Positive
    predicted_label_text = label_map.get(predicted_label, "Unknown")

    # Phân tích ngữ nghĩa
    analysis_result = analyze_sentence(text)

    return {
        "label": predicted_label_text,
        "confidence": probs[predicted_label],
        "analysis": analysis_result 
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả domain (có thể thay bằng danh sách cụ thể)
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức HTTP (GET, POST, OPTIONS,...)
    allow_headers=["*"],  # Cho phép tất cả các header
)

# Định nghĩa endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict_endpoint(request: TextRequest):
    try:
        result = predict(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/parse", response_model=DependencyResponse)
async def predict_endpoint(request: TextRequest):
    try:
        # Phân tích câu bằng spaCy
        doc = nlp(request.text)

        # Tạo dữ liệu nodes và links
        nodes = [{"id": token.text, "lemma": token.lemma_, "pos": token.pos_} for token in doc]
        links = [{"source": token.head.text, "target": token.text, "dependency": token.dep_} for token in doc if token.dep_ != "ROOT"]

        # Trả về dữ liệu dưới dạng JSON
        return {"nodes": nodes, "links": links}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
# Chạy API
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)