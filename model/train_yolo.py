import os
import sys

def train_yolo_model(data_yaml="dataset/dataset.yaml", epochs=10, imgsz=640, model_type="yolov8n-pose.pt"):
    """
    Trains a YOLOv8 Pose model for Selfie Pose Detection & Evaluation.
    """
    print(f"🚀 Initializing YOLOv8 Model Training ({model_type})...")
    
    try:
        from ultralytics import YOLO
    except ImportError:
        print("❌ 'ultralytics' package is not installed.")
        print("💡 Install using: pip install ultralytics torch torchvision opencv-python")
        print("Creating mock model weights placeholder for setup verification...")
        weights_dir = "weights"
        os.makedirs(weights_dir, exist_ok=True)
        with open(os.path.join(weights_dir, "best.pt"), "w") as f:
            f.write("# YOLOv8 Trained Selfie Pose Model Weights Placeholder\n")
        return False

    if not os.path.exists(data_yaml):
        print(f"⚠️ Dataset YAML '{data_yaml}' not found. Running dataset prep first...")
        from dataset_prep import setup_yolo_dataset
        setup_yolo_dataset()

    # Load base model (yolov8n-pose pretrained on COCO keypoints)
    model = YOLO(model_type)

    print(f"🏋️ Starting training on '{data_yaml}' for {epochs} epochs...")
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=16,
        name="yolov8_selfie_pose",
        project="runs/pose"
    )

    print("✅ YOLOv8 Training Completed!")
    best_weights = os.path.join("runs", "pose", "yolov8_selfie_pose", "weights", "best.pt")
    os.makedirs("weights", exist_ok=True)
    if os.path.exists(best_weights):
        import shutil
        shutil.copy(best_weights, os.path.join("weights", "best.pt"))
        print(f"🏆 Saved best weights to 'weights/best.pt'")
    
    return True

if __name__ == "__main__":
    train_yolo_model()
