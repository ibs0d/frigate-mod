from unittest.mock import Mock

from frigate.config import FrigateConfig
from frigate.models import Recordings
from frigate.stats.emitter import StatsEmitter
from frigate.storage import StorageMaintainer
from frigate.test.http_api.base_http_test import AuthTestClient, BaseTestHttp


class TestHttpRecordingsStorage(BaseTestHttp):
    def setUp(self):
        super().setUp([Recordings])

    def _build_app(self):
        stats = Mock(spec=StatsEmitter)
        stats.get_latest_stats.return_value = self.test_stats
        storage_maintainer = StorageMaintainer(
            FrigateConfig(**self.minimal_config),
            Mock(),
        )

        app = super().create_app(stats)
        app.storage_maintainer = storage_maintainer
        return app

    def test_recordings_storage_default_only(self):
        app = self._build_app()

        Recordings.insert(
            id="front_default_1",
            path="/media/frigate/recordings/front_door/2024-01-01/00.00.mp4",
            camera="front_door",
            start_time=100,
            end_time=110,
            duration=10,
            motion=1,
            segment_size=100,
        ).execute()

        with AuthTestClient(app) as client:
            response = client.get("/recordings/storage")
            assert response.status_code == 200
            payload = response.json()

        assert "front_door" in payload
        assert payload["front_door"]["usage"] == 100

        roots = payload["__recording_roots"]
        assert len(roots) == 1
        assert roots[0]["path"] == "/media/frigate/recordings"
        assert roots[0]["is_default"] is True
        assert roots[0]["cameras"] == ["front_door"]
        assert roots[0]["camera_usages"]["front_door"]["usage"] == 100

    def test_recordings_storage_mixed_default_and_custom_roots(self):
        self.minimal_config["cameras"]["back_yard"] = {
            "ffmpeg": {
                "inputs": [{"path": "rtsp://10.0.0.2:554/video", "roles": ["detect"]}]
            },
            "detect": {"height": 1080, "width": 1920, "fps": 5},
            "path": "/mnt/slow-recordings",
        }

        self.test_stats["service"]["storage"]["/mnt/slow-recordings"] = {
            "free": 3000,
            "mount_type": "ext4",
            "total": 4000,
            "used": 1000,
        }

        app = self._build_app()

        Recordings.insert_many(
            [
                {
                    "id": "front_default_1",
                    "path": "/media/frigate/recordings/front_door/2024-01-01/00.00.mp4",
                    "camera": "front_door",
                    "start_time": 100,
                    "end_time": 110,
                    "duration": 10,
                    "motion": 1,
                    "segment_size": 100,
                },
                {
                    "id": "back_custom_1",
                    "path": "/mnt/slow-recordings/back_yard/2024-01-01/00.00.mp4",
                    "camera": "back_yard",
                    "start_time": 200,
                    "end_time": 210,
                    "duration": 10,
                    "motion": 1,
                    "segment_size": 250,
                },
            ]
        ).execute()

        with AuthTestClient(app) as client:
            payload = client.get("/recordings/storage").json()

        roots = {root["path"]: root for root in payload["__recording_roots"]}
        assert len(roots) == 2
        assert roots["/media/frigate/recordings"]["recordings_size"] == 100
        assert roots["/mnt/slow-recordings"]["recordings_size"] == 250
        assert roots["/mnt/slow-recordings"]["is_default"] is False
        assert roots["/mnt/slow-recordings"]["cameras"] == ["back_yard"]

    def test_recordings_storage_multiple_cameras_share_custom_root_and_shape(self):
        self.minimal_config["cameras"]["back_yard"] = {
            "ffmpeg": {
                "inputs": [{"path": "rtsp://10.0.0.2:554/video", "roles": ["detect"]}]
            },
            "detect": {"height": 1080, "width": 1920, "fps": 5},
            "path": "/mnt/shared-recordings",
        }
        self.minimal_config["cameras"]["garage"] = {
            "ffmpeg": {
                "inputs": [{"path": "rtsp://10.0.0.3:554/video", "roles": ["detect"]}]
            },
            "detect": {"height": 1080, "width": 1920, "fps": 5},
            "path": "/mnt/shared-recordings",
        }

        self.test_stats["service"]["storage"]["/mnt/shared-recordings"] = {
            "free": 800,
            "mount_type": "ext4",
            "total": 2000,
            "used": 1200,
        }

        app = self._build_app()

        Recordings.insert_many(
            [
                {
                    "id": "back_1",
                    "path": "/mnt/shared-recordings/back_yard/2024-01-01/00.00.mp4",
                    "camera": "back_yard",
                    "start_time": 100,
                    "end_time": 110,
                    "duration": 10,
                    "motion": 1,
                    "segment_size": 300,
                },
                {
                    "id": "garage_1",
                    "path": "/mnt/shared-recordings/garage/2024-01-01/00.00.mp4",
                    "camera": "garage",
                    "start_time": 200,
                    "end_time": 210,
                    "duration": 10,
                    "motion": 1,
                    "segment_size": 500,
                },
            ]
        ).execute()

        with AuthTestClient(app) as client:
            payload = client.get("/recordings/storage").json()

        shared_root = next(
            root
            for root in payload["__recording_roots"]
            if root["path"] == "/mnt/shared-recordings"
        )

        assert shared_root["recordings_size"] == 800
        assert shared_root["cameras"] == ["back_yard", "garage"]
        assert set(shared_root["camera_usages"].keys()) == {"back_yard", "garage"}
        assert {
            "path",
            "total",
            "used",
            "free",
            "usage_percent",
            "recordings_size",
            "is_default",
            "cameras",
            "camera_usages",
        } <= set(shared_root.keys())
