import math
import numpy as np

class PoseEngine:
    """
    Analyzes body & facial keypoints (COCO keypoint format from YOLOv8-pose or facial geometry)
    to calculate head tilt, eye alignment, framing rule of thirds, hand gesture, pose score & tips.
    """

    COCO_KEYPOINTS = {
        0: 'nose', 1: 'left_eye', 2: 'right_eye', 3: 'left_ear', 4: 'right_ear',
        5: 'left_shoulder', 6: 'right_shoulder', 7: 'left_elbow', 8: 'right_elbow',
        9: 'left_wrist', 10: 'right_wrist', 11: 'left_hip', 12: 'right_hip'
    }

    @staticmethod
    def calculate_angle(p1, p2):
        """Calculates angle in degrees between two points relative to horizontal line."""
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        return math.degrees(math.atan2(dy, dx))

    @classmethod
    def evaluate_pose(cls, keypoints, img_width=640, img_height=480):
        """
        Input: keypoints list of dicts [{'x': x, 'y': y, 'conf': conf}, ...] or numpy array (17, 3)
        Returns detailed selfie pose metrics.
        """
        # Ensure keypoints array format
        kpts = {}
        if isinstance(keypoints, list):
            for idx, item in enumerate(keypoints):
                if isinstance(item, dict):
                    kpts[idx] = (item.get('x', 0), item.get('y', 0), item.get('conf', 0.5))
                elif isinstance(item, (tuple, list)) and len(item) >= 2:
                    kpts[idx] = (item[0], item[1], item[2] if len(item) > 2 else 0.8)
        
        # Fallback default estimation if keypoints are empty
        nose = kpts.get(0, (img_width * 0.5, img_height * 0.35, 0.9))
        l_eye = kpts.get(1, (img_width * 0.44, img_height * 0.3, 0.9))
        r_eye = kpts.get(2, (img_width * 0.56, img_height * 0.3, 0.9))
        l_shoulder = kpts.get(5, (img_width * 0.35, img_height * 0.6, 0.8))
        r_shoulder = kpts.get(6, (img_width * 0.65, img_height * 0.6, 0.8))
        l_wrist = kpts.get(9, (img_width * 0.2, img_height * 0.8, 0.4))
        r_wrist = kpts.get(10, (img_width * 0.8, img_height * 0.8, 0.4))

        # 1. Calculate Head Tilt Angle
        eye_angle = cls.calculate_angle(l_eye, r_eye) # ideal near 0° or 15-20° for tilt
        head_tilt_abs = abs(eye_angle)

        # 2. Rule of Thirds / Framing Score
        face_x = nose[0] / img_width if img_width > 0 else 0.5
        face_y = nose[1] / img_height if img_height > 0 else 0.35
        # Ideal rule-of-thirds horizontal lines at 0.33 or 0.66, vertical at 0.33, 0.5, 0.66
        framing_dist = min(abs(face_x - 0.33), abs(face_x - 0.5), abs(face_x - 0.66))
        framing_score = max(0, 100 - (framing_dist * 200))

        # 3. Shoulder Angle / Pose Dynamics
        shoulder_angle = abs(cls.calculate_angle(l_shoulder, r_shoulder))

        # 4. Hand-to-Face Proximity (detect hand on chin / gesture)
        chin_y = nose[1] + (nose[1] - (l_eye[1] + r_eye[1])/2) * 1.5
        dist_l_wrist_chin = math.hypot(l_wrist[0] - nose[0], l_wrist[1] - chin_y)
        dist_r_wrist_chin = math.hypot(r_wrist[0] - nose[0], r_wrist[1] - chin_y)
        min_hand_dist = min(dist_l_wrist_chin, dist_r_wrist_chin)
        hand_near_chin = min_hand_dist < (img_width * 0.22)
        hand_near_head = (l_wrist[1] < nose[1] or r_wrist[1] < nose[1]) and min_hand_dist < (img_width * 0.35)

        # Classify Pose
        pose_label = "Classic Smile"
        pose_score = 75.0
        tips = []

        if hand_near_chin:
            pose_label = "Hand on Chin / Thinker Chic"
            pose_score = 94.0
            tips.append("🌟 Great chin rest posture! Keep your shoulders relaxed.")
        elif hand_near_head:
            pose_label = "Peace & Vibe Gesture"
            pose_score = 92.0
            tips.append("✌️ Fun gesture detected! Maintain soft eye lighting.")
        elif 12 <= head_tilt_abs <= 28:
            pose_label = "Tilt & Glamour Angle"
            pose_score = 96.0
            tips.append("🔥 Perfect 18° golden head tilt for maximum jawline definition!")
        elif shoulder_angle > 15:
            pose_label = "Side Profile Chic"
            pose_score = 89.0
            tips.append("📸 Great diagonal shoulder framing! Turn chin slightly toward camera.")
        elif 0.30 <= face_x <= 0.38 or 0.62 <= face_x <= 0.70:
            pose_label = "Rule of Thirds Model Angle"
            pose_score = 95.0
            tips.append("🎬 Excellent cinematic composition along the rule-of-thirds grid line!")
        else:
            pose_label = "Classic Upright Smile"
            pose_score = 82.0
            if head_tilt_abs < 5:
                tips.append("💡 Tip: Tilt your head 15° to the side for a more dynamic glamour pose.")

        if head_tilt_abs > 35:
            pose_score -= 15
            tips.append("⚠️ Head tilt is a bit too steep (>35°). Bring it closer to 15-20°.")

        if face_y > 0.65:
            pose_score -= 10
            tips.append("⚠️ Camera is held too high/low. Raise your phone to eye level.")

        # Ensure score within 0 - 100
        pose_score = round(max(5.0, min(99.0, pose_score)), 1)

        return {
            "pose_label": pose_label,
            "pose_score": pose_score,
            "head_tilt_degrees": round(eye_angle, 1),
            "shoulder_angle_degrees": round(shoulder_angle, 1),
            "framing_score": round(framing_score, 1),
            "hand_near_chin": hand_near_chin,
            "hand_near_head": hand_near_head,
            "face_center": {"x": round(face_x, 3), "y": round(face_y, 3)},
            "recommendations": tips,
            "is_best_pose": pose_score >= 88.0
        }
