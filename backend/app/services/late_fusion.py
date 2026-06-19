import torch
from transformers import CLIPProcessor, CLIPModel, WhisperProcessor, WhisperModel

class LateFusionEmbeddingService:
    def __init__(self):
        # We use standard local HuggingFace models for Image and Audio
        # This keeps the pipeline free of external APIs
        print("Loading CLIP for Vision...")
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        
        print("Loading Whisper for Audio...")
        self.whisper_model = WhisperModel.from_pretrained("openai/whisper-tiny")
        self.whisper_processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")

    async def generate_fused_embedding(self, image_input, audio_array) -> list[float]:
        """
        Takes raw image frames and audio arrays, computes their individual embeddings,
        and concatenates them into a single 'Late Fusion' semantic signature.
        This allows the Vector DB to match incidents where BOTH visual and audio match.
        """
        with torch.no_grad():
            # 1. Vision Embedding
            vision_inputs = self.clip_processor(images=image_input, return_tensors="pt")
            vision_embeds = self.clip_model.get_image_features(**vision_inputs)
            vision_embeds = vision_embeds / vision_embeds.norm(p=2, dim=-1, keepdim=True)
            
            # 2. Audio Embedding
            audio_inputs = self.whisper_processor(audio_array, sampling_rate=16000, return_tensors="pt")
            # We extract encoder hidden states as our audio embedding
            audio_outputs = self.whisper_model.encoder(audio_inputs.input_features)
            audio_embeds = audio_outputs.last_hidden_state.mean(dim=1)
            audio_embeds = audio_embeds / audio_embeds.norm(p=2, dim=-1, keepdim=True)
            
            # 3. Late Fusion (Concatenation)
            fused_tensor = torch.cat((vision_embeds, audio_embeds), dim=1)
            fused_tensor = fused_tensor / fused_tensor.norm(p=2, dim=-1, keepdim=True)
            
        return fused_tensor.squeeze().tolist()

fusion_service = LateFusionEmbeddingService()
