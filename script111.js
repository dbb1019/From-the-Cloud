let myFont, inputFont;
let video;
let fallingWords = []; // 存储正在下落的文字
let gravity = 0.2; 
let columnHeights = [];
let altitudeSlider;
let altitudeValue = 1;
let soundFiles = []; // 存储音频

function preload() {
    myFont = loadFont("assets/TINY5x3-140.otf");
    inputFont = loadFont("assets/Sligoil-Micro.otf");
    video = createVideo("assets/bg.mp4"); 

    for (let i = 1; i <= 3; i++) {
        soundFiles.push(loadSound(`assets/breath${i}.wav`));
    }
}

function setup() {
    let cnv = createCanvas(windowWidth/1, windowHeight/1);
    columnHeights = Array(3).fill(height);
    cnv.position(-0, -0); // 确保 canvas 贴在左上角
    cnv.style("display", "block"); // 防止 canvas 下面有空隙
    
    video.hide();
    video.volume(0);
    video.loop();
    video.speed(0.5);
    video.play();

    input = createInput();
    input.position(50, 99);
    input.style("font-family", "Sligoil-Micro");
    input.style("font-size", "22px");
    input.style("color", "rgb(240, 250, 255)");
    input.style("background", "rgb(120, 178, 220)");
    input.style("border", "0px solid black");
    input.style("padding", "5px");
    input.style("width", "20px"); 

    // 创建按钮
    submitButton = createButton("╰┈➤ Send ⋆°•☁︎⋆");
    submitButton.style("font-family", "Sligoil-Micro");
    submitButton.style("font-size", "16px");
    submitButton.style("color", "rgb(240, 250, 255)");
    submitButton.style("background-color", "rgb(105, 176, 235)");
    submitButton.style("border", "0px solid white");
    submitButton.style("padding", "5px");
    submitButton.style("cursor", "pointer");

    // 监听输入变化，动态调整输入框宽度，并更新按钮位置
    input.input(() => {
        let textLength = input.value().length;
        let newWidth = max(20, textLength * 14.8);
        input.style("width", `${newWidth}px`);
        updateButtonPosition();
    });

    submitButton.mousePressed(() => {
        let inputWord = input.value().trim();
        if (inputWord.length > 0) {
            getWordVariations(inputWord);
        }
    });

    updateButtonPosition();

    let resetButton = createButton("Reload");
    resetButton.style("font-family", "Sligoil-Micro"); // 和 send 按钮的字体一致
    resetButton.style("font-size", "16px");
    resetButton.style("color", "rgb(255, 253, 240)"); // 文字颜色
    resetButton.style("background", "none"); // 没有背景
    resetButton.style("border", "none"); // 去掉边框
    resetButton.style("padding", "5px");
    resetButton.style("cursor", "pointer");
    resetButton.style("text-decoration", "underline"); // 添加下划线

    // 让 Reset 按钮出现在 Send 按钮的旁边
    resetButton.position(width-120, 20);

    // 点击后刷新页面
    resetButton.mousePressed(() => {
        window.location.reload();
    });

    // 创建 Save 按钮
    let saveButton = createButton("Save");
    saveButton.style("font-family", "Sligoil-Micro"); // 和 Send 按钮的字体一致
    saveButton.style("font-size", "16px");
    saveButton.style("color", "rgb(255, 253, 240)"); // 文字颜色
    saveButton.style("background", "none"); // 无背景
    saveButton.style("border", "none"); // 无边框
    saveButton.style("padding", "5px");
    saveButton.style("cursor", "pointer");
    saveButton.style("text-decoration", "underline"); // 添加下划线

    // 让 Save 按钮出现在 Reset 按钮旁边
    saveButton.position(width-213, 20);

    // 点击后保存 TXT 文件
    saveButton.mousePressed(() => {
        saveGeneratedWords();
    });

    let aboutButton = createButton("About");
    aboutButton.style("font-family", "Sligoil-Micro");
    aboutButton.style("font-size", "16px");
    aboutButton.style("color", "rgb(255, 253, 240)"); // 文字颜色
    aboutButton.style("background", "none"); // 无背景
    aboutButton.style("border", "none"); // 无边框
    aboutButton.style("padding", "5px");
    aboutButton.style("cursor", "default"); // 设置鼠标不可点击
    aboutButton.style("text-decoration", "underline"); // 添加下划线

    // 让 About 按钮出现在 Save 按钮的左边
    aboutButton.position(width - 320, 20);

    // 创建一个 infoBox 来显示信息
    let infoBox = createDiv(`
        <strong>From the Cloud</strong><br>
        An experiment with words and clouds 
        <br><br>
        Clouds are ephemeral and untouchable, long perceived as carriers of human emotions and metaphors of impermanence. 
        However, in the digital age, "the cloud" has been redefined as a rigid repository of data and algorithmic control. 
        Designed for efficiency, cloud computing systems suppress ambiguity, randomness, and serendipity, reducing uncertainty to error.
        <br><br>
        This project seeks to dissolve these rigid structures, returning the cloud to a state of flux. 
        A GPT model (a metaphor of digital cloud) is told to disguise itself as a cloud in the sky, interacts with humans, and randomly responds three-word phrases that begin with the input word (sometimes the model might make some mistakes), forming a kind of text precipitation that floats between meaning and ambiguity. 
        These texts descend like rain -- at first discernible, then gradually becoming unclear, and the semantics fade.
        <br><br>
        This cloud seems to speak autonomously, yet it is deeply entangled with humans, shaped by human language, imagination, and manipulation. 
        Are we talking to the cloud, or are we constantly shaping our illusion of the cloud?
        <br><br>
        By Xuedan Gao ˙ᵕ˙<br>
    `);
    
    infoBox.style("font-family", "Sligoil-Micro");
    infoBox.style("font-size", "14px");
    infoBox.style("color", "rgb(240, 250, 255)"); // 文字颜色
    infoBox.style("background", "rgb(91, 158, 212)"); 
    infoBox.style("padding", "5px");
    infoBox.style("border-radius", "0px");
    infoBox.style("position", "absolute");
    infoBox.style("display", "none"); 
    infoBox.style("width", "420px"); // 设置固定宽度
    infoBox.style("line-height", "1.5"); // 让文本更容易阅读

    // 让 infoBox 在鼠标悬停时显示
    aboutButton.mouseOver(() => {
        infoBox.style("display", "block");
        infoBox.position(aboutButton.x - 150, aboutButton.y + 40);
    });

    // 当鼠标移开时隐藏 infoBox
    aboutButton.mouseOut(() => {
        infoBox.style("display", "none");
    });

    let hoverBox = createDiv("?");
    hoverBox.style("font-family", "TINY5x3-140");
    hoverBox.style("font-size", "52px"); 
    hoverBox.style("color", "rgb(240, 250, 255)"); 
    hoverBox.style("background", "rgba(121, 191, 218, 0.91)"); 
    hoverBox.style("border", "none");
    hoverBox.style("padding", "5px");
    hoverBox.style("cursor", "pointer");
    hoverBox.style("position", "absolute");
    hoverBox.position(315, 20); 
    hoverBox.style("cursor", "default"); 
    hoverBox.style("width", "20px"); 

    // 悬停时显示完整提示
    hoverBox.mouseOver(() => {
        hoverBox.html(
            "Click the blue box, enter a single word (in English), and send it to the cloud.<br><br>" +
            "If the words stack on top of each other but you want to see them clearly (or unclearly), try moving your mouse over the area to reveal them.<br><br>" +
            "Move the Temperature slider to adjust the randomness of the response.<br><br>" +
            "To save all the words, click Save to download them.<br><br>" +
            "If there are too many, click Reload.<br><br>" +
            "Please turn on the volume ▶︎ •၊၊||၊|။|||| |. "
        );          
        hoverBox.style("font-family", "Sligoil-Micro");
        hoverBox.style("font-size", "14px");
        hoverBox.style("background", "rgba(121, 191, 218, 0.91)"); 
        //hoverBox.style("border-radius", "5px");
        hoverBox.style("color", "rgb(240, 250, 255)");
        hoverBox.style("cursor", "default"); 
        hoverBox.style("width", "400px"); 
    });

    // 移开时恢复 `？`
    hoverBox.mouseOut(() => {
        hoverBox.html("?");
        hoverBox.style("font-family", "TINY5x3-140");
        hoverBox.style("font-size", "52px"); 
        hoverBox.style("background", "rgba(121, 191, 218, 0.91)");
        hoverBox.style("border-radius", "0px");
        hoverBox.style("color", "rgb(240, 250, 255)"); 
        hoverBox.style("cursor", "default"); 
        hoverBox.style("width", "20px"); 
    });

    altitudeLabel = createDiv("Temperature");
    altitudeLabel.style("font-family", "Sligoil-Micro");
    altitudeLabel.style("font-size", "16px");
    altitudeLabel.style("color", "rgb(255, 253, 240)"); // 白色文字
    altitudeLabel.style("position", "absolute");
    altitudeLabel.style("cursor", "default");

    // 创建滑动条
    let altitudeSlider = createSlider(0, 20, 12); // 0 为悲观，100 为乐观，默认 50
    altitudeSlider.style("width", "120px");
    altitudeSlider.style("border", "none");
    altitudeSlider.style("cursor", "pointer");
    altitudeSlider.style("appearance", "none"); // 移除浏览器默认样式
    altitudeSlider.style("background", "rgb(255, 253, 240)"); // 滑轨颜色
    altitudeSlider.style("height", "4px"); // 让滑轨更细

    // 创建显示数值的文本 div
    altitudeValueDisplay = createDiv("1.2");
    altitudeValueDisplay.style("font-family", "Sligoil-Micro");
    altitudeValueDisplay.style("font-size", "16px");
    altitudeValueDisplay.style("color", "rgb(255, 253, 240)");
    altitudeValueDisplay.style("position", "absolute");
    altitudeValueDisplay.position(width - 480, 25); // 让它在滑动条附近

    // 滑动条变化时更新显示的值
    altitudeSlider.input(() => {
        let sliderVal = altitudeSlider.value();
        altitudeValue = map(sliderVal, 0, 20, 0, 2); // 映射到 0 - 1 之间
        altitudeValueDisplay.html(altitudeValue);
    });

    let aboutX = width - 320;
    altitudeLabel.position(aboutX - 420, 25);
    altitudeSlider.position(aboutX - 300, 34); // 让滑动条紧挨着文字

    altitudeSlider.style(`
        -webkit-appearance: none;
        appearance: none;
        background:rgb(255, 253, 240);
        outline: none;
        height: 3px;
    `);
    
    altitudeSlider.elt.style.setProperty("--thumb-color", "#ffffff");
    altitudeSlider.elt.style.setProperty("--thumb-size", "12px");

    altitudeSlider.elt.addEventListener("input", () => {
        let altitudeValue = altitudeSlider.value();
        updateChatTone(altitudeValue);
    });

    // 使用 CSS 设置滑块的样式（确保是方形）
    let style = document.createElement("style");
    style.innerHTML = `
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 6px;
            height: 16px;
            background:rgb(255, 253, 240);
            cursor: pointer;
            border-radius: 0px; 
        }
        input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 8px;
            background: rgb(255, 253, 240);
            cursor: pointer;
            border-radius: 0px;
        }
    `;
    document.head.appendChild(style);
}

function updateButtonPosition() {
    let inputX = input.position().x;
    let inputWidth = parseInt(input.style("width"));
    submitButton.position(inputX + inputWidth + 10, 99);
}

function updateChatTone(value) {
    // 这里可以根据滑动条数值调整 ChatGPT 回答风格
    console.log("Altitude:", value); // 这里可以用来检查数值变化
}

function draw() {
    
    //fill("#fcf9f2");
    rect(-2, -2, width+2, height+2); // 透明遮罩
    image(video, 0, 0, width, height); // 画视频作为背景
    fill(202, 226, 232, 200); // 100 表示透明度（0 完全透明，255 完全不透明）
    rect(-2, -2, width+2, height+2); 

    fill(255, 254, 250);
    textFont(myFont); // 使用和输入框相同的字体
    textSize(52);
    textAlign(LEFT, CENTER);
    text("From the Cloud", 50, 40);

    // fill(255);
    // textFont(inputFont); 
    // textSize(16);
    // textAlign(LEFT, CENTER);
    // text("Click the blue box and enter a word to ask the cloud (only one word):", 50, 80); // 输入框和 Send 按钮上方的提示文本

    fill(255, 255, 255, 200);
    textFont("Arial");
    textSize(26);
    textAlign(LEFT, TOP);
    text(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣤⠤⢀⠀⠀⠀⠀⠀⠀⠐⠒⠒⠒⠶⠮⣅⣿⠛⠶⠖⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠋⢀⢰⢈⣹⠓⣾⢷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣨⠀⢠⠐⣪⣭⣅⢤⣿⠞⠳⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣟⣶⢃⡃⠟⠓⡁⣫⡄⡀⠐⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⡰⢫⣟⠿⠧⣿⣿⣥⠴⣴⣮⣏⡣⣄⣲⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⣰⣽⡵⢡⠤⠀⠈⢿⣷⠆⢚⡋⡁⢤⣿⡿⠁⠀⠀⠀⠀⢀⡤⠊⠉⠉⠙⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⣠⣤⠖⠶⡟⡧⢿⠀⠀⠀⠀⠀⠛⠶⣾⣷⡶⠟⠛⠉⢣⠀⣀⣀⣀⡜⠁⠀⠀⣠⠏⠁⠀⠀⢹⡠⠤⣄⣄⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⡜⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⣇⡀⢅⠀⠀⠀⠀
        ⠀⠀⠁⠩⠵⠴⠲⠔⠶⠶⠶⠦⠴⠶⠶⠶⠖⠦⠤⢴⠏⠀⡴⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡏⡧⡀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⠀⣀⣀⣀⢀⣀⠀⠀⠀⠀⠀⠀⣀⣀⠤⠞⠁⠀⡜⢸⡏⠀⢸⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠽⠕⠋⠘⠓⠒⠲⠤⠤⠤⡖⣛⠴⠶⡲⠮⠭⢶⣭⠦⠤⠎⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⢠⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⡀
        ⠀⠀⠀⢀⣀⣔⡽⣧⢄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡤⠴⠢⠤⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠎⠁⠀⠀⠉⢆
        ⠀⠀⠉⠉⠉⠻⡏⡗⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡔⣝⢏⠁⠀⠀⠀⢀⣉⣀⣀⡀⡄⠀⠀⢠⠴⠗⠗⠒⠒⠺⠋⠛⠉⠀
        ⠀⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠤⢉⡩⠟⣓⡿⠁⠀⠀⡖⠁⠀⠀⠀⠀⠀⠉⠳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⣒⢯⢕⣫⡯⠗⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡗⡆⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⡜⢛⣿⡇⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡄⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠁⠉⠛⠛⠉⠉⠉⠉⠁⠉⠁⠁⠁⠉⠉⠉⠒⠉⠁⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        `, width/3.8, 20);

    updateFallingWords(); // 让文字下落
    //console.log("Slider Value:", altitudeSlider.value()); 
}

function updateFallingWords() {
    for (let i = 0; i < fallingWords.length; i++) {
        let wordObj = fallingWords[i];
        let columnIndex = wordObj.column;
        let targetY = columnHeights[columnIndex] - wordObj.size + random(30, 60);

        // **检测鼠标靠近时的散开效果**
        let d = dist(mouseX, mouseY, wordObj.x, wordObj.y);
        if (d < 100) { // 当鼠标靠近 100 像素范围内
            wordObj.tX = wordObj.x + random(-40, 40);
            wordObj.tY = wordObj.y + random(-30, 30);
        } else {
            wordObj.tX = wordObj.x; // 远离后回归原位
            wordObj.tY = wordObj.y;
        }

        // **让文字平滑移动到目标位置**
        wordObj.x = lerp(wordObj.x, wordObj.tX, 0.3);
        wordObj.y = lerp(wordObj.y, wordObj.tY, 0.3);

        // **下落逻辑**
        if (!wordObj.stopped) {
            wordObj.speed += gravity;
            wordObj.y += wordObj.speed;

            if (wordObj.y >= targetY) {
                wordObj.y = targetY;
                wordObj.speed = 0;
                wordObj.stopped = true;
                columnHeights[columnIndex] = wordObj.y - random(-55, 0);
            }
        }

        // **绘制文字（带旋转效果）**
        push();
        translate(wordObj.x, wordObj.y); // **移动到 (x, y)**
        rotate(radians(wordObj.angle));  // **应用随机角度**
        fill(wordObj.color);
        textSize(wordObj.size);
        textFont(myFont);
        //fill(247, 239, 79); 
        textAlign(CENTER, CENTER);
        text(wordObj.text, 0, 0); // **注意：旋转后，(0,0) 作为文本中心**
        pop();
    }
}


function addWord(text) {
    let columnWidth = width / 3;
    let columnIndex = fallingWords.length % 3; // 计算在哪一列
    let xPos = columnIndex * columnWidth + random(60, columnWidth - 100);
    let textSizeRand = random(50, 130);
    let initialY = -textSizeRand; // 初始位置在屏幕上方

    let randomSound = random(soundFiles);
    if (randomSound && !randomSound.isPlaying()) {
        randomSound.play();
    }

    let colors = [
        color(255, 253, 247), 
        color(255, 253, 247), 
        color(250, 250, 242),
        color(136, 191, 209)
    ];

    let wordColor = random(colors);

    fallingWords.push({
        text: text,
        x: xPos,
        y: initialY,
        tX: xPos, // 目标 X 坐标
        tY: initialY, // 目标 Y 坐标
        speed: random(0.1, 3),
        size: textSizeRand,
        angle: random(-4, 4), // **每个单词有一个随机角度（-10° 到 10°）**
        column: columnIndex,
        stopped: false,
        color: wordColor // 存储颜色
    });
}


function saveGeneratedWords() {
    let textToSave = "";
    
    // 按三词一句拼接成文本
    for (let i = 0; i < fallingWords.length; i += 3) {
        if (i + 2 < fallingWords.length) {
            textToSave += `${fallingWords[i].text} ${fallingWords[i+1].text} ${fallingWords[i+2].text}\n`;
        }
    }

    // 下载为 TXT 文件
    let blob = new Blob([textToSave], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "FromTheCloud𓂃 ࣪˖⋆°•☁︎⋆.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


// async function getWordVariations(word) {
//     try {
      
//         const response = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${apiKey}`
//         },
//         body: JSON.stringify({
//           model: "gpt-4o",
//           temperature: altitudeValue,
//           messages: [
//             { role: "system", content: "You are an AI that can compose a sentence from the given words, thus generating meaning, say some thing that can inspire human to think, say something deep please. Please do not say too much whispers, whisper, shadow, light, drifr, storms, dream, echos, shadows,float, truth, indifference, dream, memory, forgotten, etc. You can use these words, but not too much. Please use various word, be creative. Your answers should be poetic, philosophical or absurd." },
//             { role: "user", content: `
//               You are a cloud in the sky. You do not think like a human but as a floating, ever-changing entity.
  
//               Generate three different semantic interpretations that begin with the word '${word}'. In each meaning, the first word must be '${word}', and the second and third word must be different. The phrase must contain 3 words in total.
  
//               Each interpretation should reflect the perspective of a cloud—detached from human emotions, but should reflect the deep issue in human society, because you live in deep time, and you observe human a lot. Your answers should be poetic, philosophical or absurd. 
  
//               Try to avoid repeating words too often. The words must make sense together.
  
//               ### **Examples**
//               For input: **"rock"**  
//               Possible output:  
//               rock echo cry, rock fracture hit, rock music club 
//               Possible output:  
//               water burden high, water betrayal ice, water regret human
  
//               Return the results as a comma-separated list, and **do not add a period at the end**.
//               Also, try your best to generate whole sentence with meaning. Please do not say too much whispers, whisper, shadow, light, drifr, storms, dream, echos, shadows,float, truth, indifference, dream, memory, forgotten, etc. You can use these words, but not too much. Please use various word, be creative, and say some thing that can inspire human to think, say something deep please.
//               Please remember, you only generate three sentence.
//               Remember your answer only contain 3 words and begin with the word '${word}'. 
//               ` }
//           ],
//           max_tokens: 50
//         })
//       });
  
//       if (!response.ok) {
//         console.error("API request failed:", response.status, await response.text());
//         return;
//       }
      
//       const data = await response.json();
//         if (data.choices) {
//             let phrases = data.choices[0].message.content.split(", "); // 3 句话

//             for (let i = 0; i < phrases.length; i++) {
//                 let wordList = phrases[i].split(" "); // 句子中的单词

//                 // **延迟每个句子的掉落**
//                 setTimeout(() => {
//                     for (let word of wordList) {
//                         addWord(word);
//                     }
//                 }, i * 1500); // **每个句子相隔 1.5 秒**
//             }
//         }
//     } catch (error) {
//         console.error("API request failed:", error);
//     }
// }


async function getWordVariations(word) {
    try {
        const response = await fetch("https://from-the-cloud.vercel.app/api/openai", {  // 🔥 替换为你的 Vercel API 地址
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                inputWord: word,
                temperature: altitudeValue  // 传递温度参数
            })
        });

        if (!response.ok) {
            console.error("API request failed:", response.status, await response.text());
            return;
        }

        const data = await response.json();
        if (data.phrases) {
            let phrases = data.phrases;

            for (let i = 0; i < phrases.length; i++) {
                let wordList = phrases[i].split(" ");

                setTimeout(() => {
                    for (let word of wordList) {
                        addWord(word);
                    }
                }, i * 1500);
            }
        }
    } catch (error) {
        console.error("API request failed:", error);
    }
}
