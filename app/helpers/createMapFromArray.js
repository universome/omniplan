export default function createMapFromArray(key, array) {
    let map = {};
    array.forEach(object => map[object[key]] = object);
    return map;
}