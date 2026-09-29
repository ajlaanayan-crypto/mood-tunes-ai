import os
import yaml
import json

def setup_yolo_dataset(base_dir="dataset"):
    """
    Sets up YOLOv8 selfie pose detection & classification dataset structure.
    Generates dataset.yaml and pose class metadata.
    """
    os.makedirs(os.path.join(base_dir, "images", "train"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "images", "val"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "labels", "train"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "labels", "val"), exist_ok=True)

    pose_classes = {
        0: "Classic Smile",
        1: "Tilt & Glamour",
        2: "Hand on Chin",
        3: "Peace & Vibe",
        4: "Side Profile",
        5: "Rule of Thirds"
    }

    yaml_content = {
        'path': os.path.abspath(base_dir),
        'train': 'images/train',
        'val': 'images/val',
        'names': pose_classes,
        'kpt_shape': [17, 3]  # 17 COCO keypoints (x, y, visibility)
    }

    yaml_path = os.path.join(base_dir, "dataset.yaml")
    with open(yaml_path, "w") as f:
        yaml.dump(yaml_content, f, default_flow_style=False)

    metadata = {
        "classes": pose_classes,
        "pose_guidelines": {
            "Classic Smile": {
                "ideal_tilt": [0, 8],
                "framing": "Centered",
                "tip": "Keep shoulders relaxed and smile naturally into the camera."
            },
            "Tilt & Glamour": {
                "ideal_tilt": [12, 28],
                "framing": "Slight angle",
                "tip": "Tilt your head 15°-25° to highlight your jawline and key features!"
            },
            "Hand on Chin": {
                "ideal_tilt": [5, 15],
                "hand_required": True,
                "tip": "Rest your hand gently under your chin for a thoughtful, chic aesthetic."
            },
            "Peace & Vibe": {
                "ideal_tilt": [5, 20],
                "gesture_required": True,
                "tip": "Bring your hand up near your cheek with a peace or cute gesture."
            },
            "Side Profile": {
                "ideal_tilt": [10, 20],
                "profile_angle": [35, 60],
                "tip": "Turn your face 45° away from camera to capture a sharp side profile."
            },
            "Rule of Thirds": {
                "ideal_offset": [0.25, 0.4],
                "tip": "Position your face along the vertical grid line for a cinematic model shot."
            }
        }
    }

    metadata_path = os.path.join(base_dir, "pose_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"✅ YOLOv8 Selfie Pose Dataset configured successfully at '{base_dir}'")
    print(f"📄 Dataset Config: {yaml_path}")
    print(f"📄 Pose Metadata: {metadata_path}")

if __name__ == "__main__":
    setup_yolo_dataset()
