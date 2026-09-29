from pose_engine import PoseEngine

def test_pose_engine():
    print("🧪 Running PoseEngine test calculations...")
    
    # 1. Test Classic Upright
    kpts_straight = [(320, 160), (290, 140), (350, 140), (260, 145), (380, 145), (220, 280), (420, 280)]
    res_straight = PoseEngine.evaluate_pose(kpts_straight, 640, 480)
    print(f"✅ Upright Pose Result: {res_straight['pose_label']} (Score: {res_straight['pose_score']}%)")

    # 2. Test 18° Tilt Glamour
    # Eyeline tilt: left eye at (280, 130), right eye at (360, 155) -> dy=25, dx=80 -> ~17.3° tilt
    kpts_tilt = [(320, 160), (280, 130), (360, 155), (250, 135), (390, 165), (220, 280), (420, 280)]
    res_tilt = PoseEngine.evaluate_pose(kpts_tilt, 640, 480)
    print(f"✅ Tilt Glamour Result: {res_tilt['pose_label']} (Score: {res_tilt['pose_score']}%)")
    print(f"   Tilt angle: {res_tilt['head_tilt_degrees']}°")
    print(f"   Tips: {res_tilt['recommendations']}")

    assert res_tilt['pose_score'] >= 85.0, "Expected high score for 18° Glamour tilt"
    print("🎉 All PoseEngine unit tests passed!")

if __name__ == "__main__":
    test_pose_engine()
