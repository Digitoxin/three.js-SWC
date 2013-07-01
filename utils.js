function clamp(min, val, max){
    if (val < min){
        return min;
    } else if (val > max) {
        return max;
    }
    return val;
}
