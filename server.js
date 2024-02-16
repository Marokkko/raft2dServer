const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const codesFilePath = 'codes.json';

app.post('/player-connect', (req, res) => {
    const playerName = req.body.playerName;
    const universalCode = req.body.universalCode;
    const money = req.body.money;

    console.log(`Получены данные: playerName=${playerName}, universalCode=${universalCode}, money=${money}`);

    let codes = loadCodes();

    if (codes[universalCode]) {
        console.log(`Игрок ${playerName} подключился. Уже существующий универсальный код.`);
    } else {
        console.log(`Новый игрок ${playerName} подключился. Универсальный код: ${universalCode}. Деньги: ${money}`);
        codes[universalCode] = { playerName, money };
        saveCodes(codes);
    }

    res.send('Данные успешно получены.');
});

app.get('/player-connect', (req, res) => {
    const playerName = req.query.playerName;
    const universalCode = req.query.universalCode;

    console.log(`Получен GET-запрос: playerName=${playerName}, universalCode=${universalCode}`);

    let codes = loadCodes();

    if (codes[universalCode]) {
        console.log(`Игрок ${playerName} уже существует. Отправляем данные о деньгах: ${codes[universalCode].money}`);
        res.send(codes[universalCode].money.toString());
    } else {
        console.log(`Игрок ${playerName} не найден.`);
        res.send('');
    }
});

app.post('/update-money', (req, res) => {
    const playerName = req.body.playerName;
    const universalCode = req.body.universalCode;
    const money = req.body.money;

    console.log(`Обновление данных о деньгах: playerName=${playerName}, universalCode=${universalCode}, money=${money}`);

    let codes = loadCodes();

    if (codes[universalCode]) {
        codes[universalCode].money = money;
        saveCodes(codes);
        console.log(`Данные о деньгах обновлены.`);
        res.send('Данные успешно обновлены.');
    } else {
        console.log(`Игрок ${playerName} не найден. Невозможно обновить данные о деньгах.`);
        res.status(404).send('Игрок не найден.');
    }
});



function loadCodes() {
    try {
        if (fs.existsSync(codesFilePath)) {
            const data = fs.readFileSync(codesFilePath);
            return JSON.parse(data);
        } else {
            console.log(`Файл ${codesFilePath} не найден. Создаем новый.`);
            return {};
        }
    } catch (error) {
        console.error('Ошибка при чтении файла с универсальными кодами:', error);
        return {};
    }
}

function saveCodes(codes) {
    try {
        fs.writeFileSync(codesFilePath, JSON.stringify(codes, null, 2));
    } catch (error) {
        console.error('Ошибка при сохранении универсальных кодов:', error);
    }
}

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
