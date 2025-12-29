game farming multiplayer bergaya pixelated yang kamu rencanakan. Fokus risetnya meliputi:

Arsitektur teknis komplit untuk React Three Fiber + Drei

Sistem multiplayer (join friend, guild, world ID) dengan Supabase

Integrasi AI NPC adaptif dengan dukungan API model dari Gemini, OpenRouter, dll.

Sistem pertanian, inventory, hewan peliharaan (termasuk mitologi), dan sistem day-night

Sistem chat dan interaksi NPC radius-based dengan dukungan TTS Indo-Jepang via VITS

UI/UX dan interaktivitas menyerupai Minecraft

Referensi open source project GitHub yang relevan

Aku akan pastikan semuanya bisa saling bekerja harmonis, tanpa konflik, dan menyenangkan secara psikologis dengan elemen-elemen game loop yang membuat ketagihan.


React Three Fiber (R3F) menjadi basis rendering 3D. R3F adalah renderer React untuk Three.js yang memungkinkan pembuatan adegan 3D secara deklaratif
github.com
. Framework pendukungnya, React Three Drei, menyediakan kumpulan komponen helper siap pakai (seperti kamera, kontrol, atau gizmos) untuk mempercepat pengembangan dunia 3D
github.com
. Sebagai contoh, proyek open-source Stellar Nomad dibuat menggunakan TypeScript, R3F, dan Next.js
github.com
, membuktikan kelayakan gim 3D kompleks di browser.

Untuk backend, kami menggunakan Supabase untuk otentikasi pengguna, penyimpanan data, dan fitur real-time multiplayer. Supabase secara eksplisit mendukung sinkronisasi game real-time dan database pemain
medium.com
. Data seperti status ladang, inventori, dan daftar teman disimpan di Postgres Supabase, sedangkan Supabase Auth mengurus login dan manajemen sesi pemain. Sisi AI menggunakan model-model besar (GPT, Gemini, dll.) melalui API seperti OpenAI atau penyedia agregator seperti OpenRouter. OpenRouter menyediakan API kompatibel OpenAI ke ratusan model AI
openrouter.ai
, sehingga kita bisa memilih model (misal Google Gemini Flash atau ChatGPT) sesuai kebutuhan game.

Desain Dunia dan Gameplay

Dunia game adalah peta 3D top-down (drone view) isometrik. Siklus waktu siang-malam diimplementasikan dengan memindahkan posisi matahari dan langit; misalnya modul eksternal threex.daynight sudah menyediakan siklus siang-malam otomatis (termasuk sinar matahari, langit, bintang) untuk Three.js
github.com
. Gaya visual mengambil arah low-poly/pixelated. Dengan shader khusus (seperti hello-threejs shader) efek blok-piksel 3D bisa dicapai
discourse.threejs.org
discourse.threejs.org
, sehingga karakter dan dunia terlihat sederhana dan mudah dianimasikan. Area bertani terdiri dari petak tanah (grid) yang bisa dibajak, ditanami bibit, dan disiram, lalu panen setelah beberapa siklus waktu. Di area hutan, pemain dapat menebang pohon untuk kayu dan menemukan bibit pohon baru. Pemain juga dapat membangun bangunan (lumbung, gudang, pabrik, dll.) dengan sistem grid drag-and-drop. Sistem inventori ala Minecraft (grid item, hotbar) dikelola melalui React state dan UI overlay, dengan slot–slot untuk peralatan, bibit, dan barang dagangan. Pemain menggunakan alat seperti cangkul, kapak, atau gergaji untuk berinteraksi dengan dunia (mencangkul tanah, memotong kayu), dan setiap alat memiliki efek tertentu terhadap objek 3D di scene. Tumbuhan yang sudah siap panen menghasilkan material yang bisa dijual atau diproses. Selain hewan ternak sehari-hari (ayam, sapi, domba) dengan trait khusus (misalnya ayam memberi telur atau pupuk), ditambahkan pula hewan fantasi (unicorn, naga, dsb.) yang bisa memberikan sumber daya langka atau buffs khusus. Peti penyimpanan (chest) disediakan untuk menyimpan barang dalam kuantitas besar.

Sistem NPC dan AI

NPC (karakter non-pemain) dilengkapi AI adaptif. Pemain dapat mengeluarkan perintah atau mengajarkan tugas baru kepada NPC. Misalnya, perintah kompleks seperti “ambilkan aku jetpack” dapat dipecah menjadi rangkaian tindakan atom (move, pickup, drop, dst.) oleh sistem AI
convai.com
. Setiap NPC memiliki profil persona dan fokus tugas sendiri; misalnya NPC yang sedang sibuk atau berkepribadian tertentu mungkin menolak atau menunda perintah baru
convai.com
. Hal ini menambah variasi perilaku NPC. Mekanisme obrolan juga berbasis radius: ketika pemain memicu dialog, hanya NPC dalam jarak tertentu (dihitung via koordinat 3D) yang mendengar dan merespons. Respons NPC dihasilkan dengan model bahasa (ChatGPT/Gemini), lalu ditampilkan sebagai teks interaktif. Teks balasan diproduksi dalam bahasa Indonesia maupun Jepang (misal dialog bilingual) untuk memperkaya pengalaman. Untuk suara, kita menggunakan model TTS VITS. Contohnya, Hugging Face menyediakan model VITS TTS Bahasa Indonesia (misalnya vits-tts-id)
huggingface.co
 dan model VITS Jepang (misalnya Vits-TTS-Japanese-Only-Amitaro oleh Lycoris53)
huggingface.co
. Suara sintetis ini di-host sendiri dalam game, misalnya melalui gedung atau layanan in-game yang bisa “menyewa” kemampuan suara dengan biaya.

Antarmuka Pengguna (UI/UX)

UI dibuat intuitif seperti game survival/pertanian populer. Antarmuka inventori tampil sebagai grid item (mirip Minecraft), dengan hotbar untuk alat. Pemain dapat drag-and-drop item antara inventori dan peti penyimpanan. Ada panel status waktu (hari/malam), uang, dan cuaca. Sistem tooltip dan hud muncul ketika kursor mengarah ke tanaman, alat, atau NPC. Kontrol kamera utama berupa pandangan top-down/drone; kamera default orthographic atau perspektif diseting tinggi. Pengguna dapat mengganti ke kamera bebas (free cam), misalnya via komponen kamera Perspektif dan kontrol Orbit dari drei. Menu pengaturan memungkinkan menyesuaikan preferensi audio, bahasa, kontrol, dan grafis. Interaksi alat di-UI berupa ikon alat aktif dan animasi sederhana saat dipakai (misal genggaman sabit saat memotong alang-alang).

Multiplayer & Fitur Sosial

Game mendukung mode multi-pemain. Pemain masuk (login) menggunakan akun Supabase Auth. Pemain dapat menambahkan teman dan bergabung ke dunia teman dengan beberapa cara: berbagi ID dunia publik, mengirim undangan (add friend), atau bergabung ke grup/guild yang sama. Setiap dunia multiplayer disinkronkan dengan real-time (via Supabase Realtime atau WebSocket) sehingga beberapa pemain dapat bermain di instance yang sama. Data dunia (posisi bangunan, status ladang, dll.) disimpan di database dan dipublish ke semua klien. Fitur sosial tambahan seperti chat antar pemain, guild quests, atau leaderboard bisa ditambahkan untuk mempererat interaksi.

Keterikatan Pemain (Game Psychology)

Untuk menjaga agar game selalu menarik, diterapkan mekanisme reward loops. Misalnya, setiap hari login pemain diberi hadiah kecil (bonus uang atau item)
gamedesignskills.com
 sehingga membangun kebiasaan harian. Tugas harian (daily quests) seperti menanam sejumlah pohon atau memanen tanaman juga menambah insentif masuk. Sistem idle (misal hewan peliharaan yang tetap bekerja saat pemain offline) memberi sumber daya pasif, sehingga pemain merasa ada progres meski tidak selalu bermain aktif
gamedesignskills.com
. Fitur progresi seperti upgrade alat, unlock bangunan, atau quest story menambah tujuan jangka panjang. Aspek sosial—bermain bersama teman, ikut guild—meningkatkan rasa kompetisi dan kebersamaan. Dengan kombinasi hadiah terjadwal dan interaksi sosial, pemain cenderung tetap kembali ke game.

<!-- #### Referensi / Contoh Repositori Sebagai acuan teknis, lihat beberapa proyek terkait: *Stellar Nomad* (game eksplorasi browser dengan R3F):contentReference[oaicite:15]{index=15}; ekstensi *threex.daynight* (contoh siklus hari/malam untuk Three.js):contentReference[oaicite:16]{index=16}; shader pixel-art *hello-threejs* oleh KodyJKing:contentReference[oaicite:17]{index=17}. -->