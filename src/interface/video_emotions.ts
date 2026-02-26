export type Artifacts = {
  video_id: string;
  dir: string;           // e.g. "/static/vid_xxx/"
  images: string[];      // e.g. ["/static/vid_xxx/frame_0001.jpg", ...]
  au_files: string[];    // e.g. ["/static/vid_xxx/frame_0001_au.npy", ...]
  au_summary_csv: string;// e.g. "/static/vid_xxx/au_summary.csv"
  meta_json: string;     // e.g. "/static/vid_xxx/meta.json"
};


export type Segment = {
  start: number;
  end: number;
  emotion: string;
  confidence: number;

  // --- ข้อมูลเสริมจาก backend เพื่อ visualization ---
  probs?: Record<string, number>;   // เช่น { Happy: 0.42, Sad: 0.10, ... }
  attention?: number[];             // ยาวเท่าจำนวนเฟรมในช่วง (เช่น 24)
  topk_frames?: number[];           // global frame indices ที่ attention สูงสุด
  frame_indices?: number[];         // global frame indices ของช่วงนี้ทั้งหมด
  topk_image_paths?: string[];      // URL/พาธรูปของ top-K frames (ถ้ามี)
};

export type AnalyzeResponse = {
  fps: number; // ใช้คำนวณวินาทีจาก frame index
  segments: Segment[];
  per_sec: Array<{ t: number } & Record<string, number>>;
};


export type CardState = {
  loadingVideo: boolean;
  videoURL: string | null;  
  analyzing: boolean;
  error: string | null;
  result: AnalyzeResponse | null;
};
