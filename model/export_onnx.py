import os

def export_model_to_onnx(weights_path="weights/best.pt"):
    """
    Exports trained YOLOv8 PyTorch model (.pt) to ONNX format.
    """
    print(f"📦 Exporting '{weights_path}' to ONNX format...")
    try:
        from ultralytics import YOLO
        if os.path.exists(weights_path):
            model = YOLO(weights_path)
            exported_path = model.export(format="onnx")
            print(f"✅ Exported successfully to: {exported_path}")
            return exported_path
        else:
            print(f"⚠️ Weights file '{weights_path}' does not exist yet. Please run training first.")
    except Exception as e:
        print(f"❌ Export failed: {e}")
    return None

if __name__ == "__main__":
    export_model_to_onnx()
