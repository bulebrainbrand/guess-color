const modeToCorrectScore = {
    0:60,
    1:75,
    2:90
}
const modeToStr = {
    0:"かんたん",
    1:"ふつう",
    2:"むずかしい"
}

let colorData = null
let mode = 0
let health = 3
let questionColor = null
let currentScore = 0
let questionColorName = null

const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'classic',
    default: '#cccccc',
    swatches: [],
    components:{
        preview: true,
        opacity: false,
        lockOpacity: true, 
        hue:true,
        clear: false,
    }
});

const submitButton = document.getElementById("submit")

const form = document.getElementById("form")

pickr.on("change",(color) => {
  const [r,g,b,a] = color.toRGBA()
  submitButton.style.backgroundColor = color.toRGBA().toString()
  submitButton.style.color = `rgb(${255-r},${255-g},${255-b})`
  document.documentElement.style.setProperty("--input-color",`rgb(${r},${g},${b})`)
})

function showColor(name,r,g,b,isCorrect){
    const text = document.getElementById("result-color-name")
    if(name === "default"){
        text.textContent = "ここに前回の答えが表示されます"
    }
    else{
    text.textContent = `${isCorrect?"🟢正解!":"❌不正解!"} ${name}は:`}
    const div = document.getElementById("show-color")
    div.style.setProperty("--color",`rgb(${r},${g},${b})`)
}

/**
 * RGBをLabに変換し、色差(Delta E)を0-100で返す
 */
function getColorScore(rgb1, rgb2) {
    console.log(rgb1,rgb2)
    const lab1 = rgbToLab(rgb1);
    const lab2 = rgbToLab(rgb2);

    const dL = lab1[0] - lab2[0];
    const da = lab1[1] - lab2[1];
    const db = lab1[2] - lab2[2];

    const deltaE = Math.sqrt(dL * dL + da * da + db * db);

    // Delta E (CIE76) の最大値は約100〜115程度ですが、
    // 実用上は100でキャップ（または正規化）するのが一般的です
    console.log(100-(deltaE / 1.15))
    return Math.floor(100-(deltaE / 1.15));
}

// 内部関数: RGB -> XYZ -> Lab への変換
function rgbToLab([r, g, b]) {
    // 1. RGB (0-255) を 0-1 への正規化とガンマ補正
    let [R, G, B] = [r, g, b].map(v => {
        v /= 255;
        return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
    });

    // 2. XYZ空間へ変換 (D65光源)
    let x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    let y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 1.00000;
    let z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;

    // 3. Lab空間へ変換
    const f = t => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + (16/116);
    
    const L = (116 * f(y)) - 16;
    const a = 500 * (f(x) - f(y));
    const b_val = 200 * (f(y) - f(z));

    return [L, a, b_val];
}

function reRenderingHealth(health){
    document.getElementById("health").textContent = "♥️".repeat(health)
}

function reRenderingScore(score){
    document.getElementById("score").textContent = score
}

function showCorrect(){
    const frame = document.getElementById("frame")
    frame.classList.remove("correct")
    frame.classList.remove("failed")
    frame.offsetWidth
    frame.classList.add("correct")
}

function showFailed(){
    const frame = document.getElementById("frame")
    frame.classList.remove("correct")
    frame.classList.remove("failed")
    frame.offsetWidth
    frame.classList.add("failed")
}

async function nextQuestion(){
    if(colorData == null)await load()
    const keys = Object.keys(colorData[mode])
    const key = keys[Math.floor(Math.random() * keys.length)]
    const questionText = document.getElementById("question-text")
    const questionSubText = document.getElementById("question-sub-text")
    questionSubText.textContent = colorData[mode][key][3]
    questionText.textContent = key
    questionColor = colorData[mode][key].slice(0,3)
    questionColorName = key
}

function failed(){
    health--
    if(health <= 0){
      end()
      return;
    }
    reRenderingHealth(health)
    showFailed()
    nextQuestion()
}

function correct(score){
    currentScore+=score
    reRenderingScore(currentScore)
    showCorrect()
    nextQuestion()
}

form.addEventListener("submit",(e) => {
    e.preventDefault()
    const [r,g,b] = pickr.getColor().toRGBA()
    const score = getColorScore([r,g,b],questionColor)
    const isCorrect = score >= modeToCorrectScore[mode]
    showColor(questionColorName,...questionColor,isCorrect)
    if(isCorrect){
        correct(score)
        
    }
    else{
        failed()
    }
})

async function fetchJson(link){
  const response = await fetch(link)
  const data = await response.json()
  return data
}


async function load(){
  colorData = await fetchJson("./data.json")
}

function start() {
  health = 3
  currentScore = 0
  reRenderingScore(currentScore)
  reRenderingHealth(health)
  submitButton.style = ""
  nextQuestion()
  showColor("default",0,0,0)
}

function end(){
    alert(`あなたのスコア: ${currentScore}\n難易度:${modeToStr[mode]}`)
    start()
}

const easyButton = document.getElementById("easy-button")

easyButton.addEventListener("click",e => {
  mode = 0
  window.scrollTo({
  top: 0,
  behavior: "smooth" // スムーズにスクロール
});
  start()
})

const normalButton = document.getElementById("normal-button")

normalButton.addEventListener("click",e => {
  mode = 1
  window.scrollTo({
  top: 0,
  behavior: "smooth" // スムーズにスクロール
});
  start()
})

const hardButton = document.getElementById("hard-button")

hardButton.addEventListener("click",e => {
  mode = 2
  window.scrollTo({
  top: 0,
  behavior: "smooth" // スムーズにスクロール
});
  start()
})

start()