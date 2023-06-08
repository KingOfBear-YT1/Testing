const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Menyediakan akses ke folder assets, css, dan js
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

const ucapanDataPath = path.join(__dirname, 'js/ucapan.json');

// Function untuk memeriksa keberadaan file ucapan.json
function cekFileUcapan() {
  if (!fs.existsSync(ucapanDataPath)) {
    buatDatabaseUcapan();
  } else {
    console.log('File ucapan.json sudah ada.');
  }
}

// Function untuk membuat file database ucapan.json
function buatDatabaseUcapan() {
  const database = {
    ucapan: []
  };

  const jsonData = JSON.stringify(database, null, 2);

  fs.writeFile(ucapanDataPath, jsonData, (err) => {
    if (err) {
      console.error('Terjadi kesalahan saat membuat database ucapan:', err);
    } else {
      console.log('Database ucapan berhasil dibuat.');
    }
  });
}

// Panggil function cekFileUcapan saat server dijalankan
cekFileUcapan();

// Function Jam wib Hari Tanggal Sekarang
function getCurrentDateTimeWIB() {
  const now = new Date();

  const options = {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    weekday: undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  const dateTimeFormat = new Intl.DateTimeFormat('id-ID', options);
  const [
    { value: day },
    ,
    { value: month },
    ,
    { value: year },
    ,
    { value: hour },
    ,
    { value: minute },
    ,
    { value: second }
  ] = dateTimeFormat.formatToParts(now);

  const dateTimeString = `${day}-${month}-${year} ${hour}:${minute}:${second} WIB`;
  return dateTimeString;
}

// Mendefinisikan rute untuk menyimpan ucapan
app.get('/api/ucapan', (req, res) => {
  // Membaca data ucapan dari file JSON
  fs.readFile(ucapanDataPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat membaca file.');
      return;
    }

    let ucapanData = {
      ucapan: []
    };

    if (data) {
      // Jika file tidak kosong, parse data JSON yang sudah ada
      ucapanData = JSON.parse(data);
    }

    const id = uuidv4();
        const nama = req.query.nama;
    const ucapan = req.query.ucapan;
    const kehadiran = req.query.kehadiran;

    if (!nama || !ucapan || !kehadiran) {
      res.status(400).send('Silahkan masukkan nama, ucapan, dan kehadiran pada saat pemanggilan melalui URL.');
      return;
    }

    const currentDateTimeWIB = getCurrentDateTimeWIB();

    const ucapanBaru = {
      id: id,
      nama: nama,
      kehadiran: kehadiran,
      waktu: currentDateTimeWIB,
      ucapan: ucapan
    };

    // Tambahkan ucapan baru ke array ucapanData.ucapan
    ucapanData.ucapan.unshift(ucapanBaru);

    // Menyimpan data ucapan ke file JSON
    fs.writeFile(ucapanDataPath, JSON.stringify(ucapanData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan saat menyimpan data.');
        return;
      }

      res.status(201).send('Data ucapan berhasil disimpan.');
    });
  });
});

app.get('/api/hasil', (req, res) => {
  fs.readFile(ucapanDataPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat membaca file.');
      return;
    }

    let ucapanData = {
      ucapan: []
    };

    if (data) {
      ucapanData = JSON.parse(data);
    }

    ucapanData.ucapan.sort((a, b) => {
      return new Date(b.waktu) - new Date(a.waktu);
    });

    res.status(200).json(ucapanData);
  });
});

// Menjalankan server pada port 3000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Menjalankan server pada port 3000
app.listen(3000, () => {
  console.log('Server berjalan pada port 3000');
});
