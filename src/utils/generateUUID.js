function generateUUID() {
    // Генерация случайного значения для каждого сегмента UUID
    function randomHexDigit() {
        return Math.floor(Math.random() * 16).toString(16);
    }

    function generateSegment(length) {
        let segment = '';
        for (let i = 0; i < length; i++) {
            segment += randomHexDigit();
        }
        return segment;
    }

    // Формирование UUID из сегментов
    const uuid = `${generateSegment(8)}-${generateSegment(4)}-4${generateSegment(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${generateSegment(3)}-${generateSegment(12)}`;

    return uuid;
}

export default generateUUID