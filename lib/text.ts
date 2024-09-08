

function textToWords(text: string): string[] {
    return text.trim().split(/\s+/);
}


export const text = {
    textToWords,
}


export default text;
