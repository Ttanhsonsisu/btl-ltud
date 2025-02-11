from transformers import BertTokenizer
import pandas as pd
from transformers import BertForSequenceClassification, AdamW
import torch
from torch.utils.data import Dataset, DataLoader
# Load pre-trained BERT tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# Load dataset
#df = pd.read_csv('dataset2.csv')
df = pd.read_csv('dataset_test3.csv')
# Kiểm tra và loại bỏ các hàng có giá trị NaN trong cột 'text'
df = df.dropna(subset=['text'])
# Điền giá trị mặc định cho các giá trị NaN trong cột 'text'
df['text'] = df['text'].fillna("")
#df = pd.read_csv("../dataset/twitter_training.csv", header=None, names=["id", "category", "label", "text"])

print(df['label'].unique())
# Tokenize and encode the text data
def encode_text(text):
    return tokenizer.encode_plus(
        text,
        add_special_tokens=True,  # Add [CLS] and [SEP]
        max_length=64,            # Truncate or pad to 64 tokens
        padding='max_length',     # Pad to max_length
        truncation=True,          # Truncate if longer than max_length
        return_attention_mask=True,  # Generate attention mask
        return_tensors='pt'       # Return PyTorch tensors
    )

# Apply encoding to the dataset
df['encoded'] = df['text'].apply(lambda x: encode_text(x))

# Split into input_ids, attention_mask, and token_type_ids
df['input_ids'] = df['encoded'].apply(lambda x: x['input_ids'].squeeze(0))
df['attention_mask'] = df['encoded'].apply(lambda x: x['attention_mask'].squeeze(0))

# Convert labels to numerical values
label_map = {'Positive': 1, 'Negative': 0 , "Neutral": 2 , "Irrelevant": 3}  # Example mapping
df['label'] = df['label'].map(label_map)

# Custom Dataset class
class TextDataset(Dataset):
    def __init__(self, input_ids, attention_mask, labels):
        self.input_ids = input_ids
        self.attention_mask = attention_mask
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return {
            'input_ids': self.input_ids[idx],
            'attention_mask': self.attention_mask[idx],
            'labels': torch.tensor(self.labels[idx], dtype=torch.long)
        }

# Prepare data for DataLoader
input_ids = torch.stack(df['input_ids'].tolist())
attention_mask = torch.stack(df['attention_mask'].tolist())
labels = df['label'].tolist()

# Create Dataset
dataset = TextDataset(input_ids, attention_mask, labels)

# Create DataLoader
dataloader = DataLoader(dataset, batch_size=8, shuffle=True)

# Load pre-trained BERT model with a classification head
model = BertForSequenceClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=4  # Number of classes (e.g., 2 for binary classification)
)

# Move model to GPU (if available)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

# Set up optimizer and loss function
optimizer = AdamW(model.parameters(), lr=2e-5)
loss_fn = torch.nn.CrossEntropyLoss()

# Training loop
epochs = 3
for epoch in range(epochs):
    model.train()
    total_loss = 0

    for batch in dataloader:
        # Move batch to device
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)

        # Forward pass
        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        total_loss += loss.item()

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    # Print average loss for the epoch
    avg_loss = total_loss / len(dataloader)
    print(f'Epoch {epoch + 1}/{epochs}, Loss: {avg_loss:.4f}')

# Save the model and tokenizer (deploy model)
model.save_pretrained("./saved_model")
tokenizer.save_pretrained("./saved_model")