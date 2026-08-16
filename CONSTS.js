const STORJ_ENDPOINT = "https://gateway.storjshare.io";
const STORJ_BUCKET = "UPLOUDE"
const STORJ_ACCESS_KEY = "jwpzqwze23opztdku5qcsaxy7ppq"
const STORJ_SECRET_KEY = "jyzccnavnzb7qovb7lupzxgmawckvm5rgcpfgngt2ayogoil3vyne"
const PART_SECONDS = 300;
const MAX_SAFE_PART_BYTES =90 * 1024 * 1024;
const PBKDF2_ITERATIONS = 300000;
const MAGIC = new TextEncoder().encode("MOVSENC1");
const HEADER_SIZE = 21;
let ffmpeg = null;
let ffmpegLoaded = false;
let cancelled = false;
let inputName = null;
const $ = id => document.getElementById(id);
const STORJ_REGION = "global";