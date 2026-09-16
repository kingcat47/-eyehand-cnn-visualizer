import json
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import datasets, transforms


class DigitModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Flatten(),
            nn.Linear(784, 128),
            nn.ReLU(),
            nn.Linear(128, 32),
            nn.ReLU(),
            nn.Linear(32, 2),
        )
        self.linear1 = nn.Linear(2, 2)
        self.relu = nn.ReLU()
        self.linear2 = nn.Linear(2, 2)
        self.classifier = nn.Linear(2, 10)

    def forward(self, image):
        z0 = self.encoder(image)
        z1 = self.linear1(z0)
        z2 = self.relu(z1)
        z3 = self.linear2(z2)
        logits = self.classifier(z3)
        return z0, z1, z2, z3, logits


ROOT = Path(__file__).resolve().parents[3]
model = DigitModel()
model.load_state_dict(torch.load(ROOT / "digit_model.pth", map_location="cpu"))
model.eval()
dataset = datasets.MNIST(ROOT / "data", train=False, download=False, transform=transforms.ToTensor())
image, label = dataset[0]

with torch.no_grad():
    z0, z1, z2, z3, logits = model(image.unsqueeze(0))
    probabilities = torch.softmax(logits, dim=1)[0]
    prediction = int(torch.argmax(probabilities).item())

reference = {
    "label": int(label),
    "input": image.flatten().tolist(),
    "expected": {
        "z0": z0[0].tolist(),
        "z1": z1[0].tolist(),
        "z2": z2[0].tolist(),
        "z3": z3[0].tolist(),
        "logits": logits[0].tolist(),
        "probabilities": probabilities.tolist(),
        "prediction": prediction,
        "confidence": float(probabilities[prediction].item()),
    },
}

output = ROOT / "web" / "web" / "src" / "model" / "inference-reference.json"
output.write_text(json.dumps(reference, indent=2), encoding="utf-8")
print(f"Wrote {output}")