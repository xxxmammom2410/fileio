// console.log("main.js")

// const _input = document.querySelector('input');
// console.log(_input);

// _input.addEventListener('change',() => {
//   console.log(_input.files[0]);
//   const _file = _input.files[0];
//   const reader = new FileReader();

//   reader.addEventListener("load", () => {
//     // this will then display a text file
//     console.log(reader.result);
//   }, false);

//   reader.readAsText(_file);
// })


let ret = "";
let previousTime = ""
let duration = 0;
let taskAlias = 0;
let contentBuffer = ""

const convertedText = document.querySelector('#convertedText');
const plainText = document.querySelector('#plainText')
const convertBtn = document.querySelector('#convertPlainTxt');



convertBtn.addEventListener('click',() => {
  // convertedText.value = '';
  ret = '';
  taskAlias = 0;
  previousTime = '';
  let lines = plainText.value.split(/\r\n|\n/);
  for (let line = 0; line < lines.length; line++) {
    convert2mermaid(lines[line]);
  }
  convertedText.value = "gantt\n    title A Gantt Diagram\n  	dateFormat HH:mm\n	axisFormat %H:%M\ntickInterval 10minute\nsection Section\n" + ret

})


document.getElementById('file').onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let lines = this.result.split(/\r\n|\n/);
    for (let line = 0; line < lines.length; line++) {
      convert2mermaid(lines[line]);
    }
    convertedText.value = "gantt\n    title A Gantt Diagram\n  	dateFormat HH:mm\n	axisFormat %H:%M\ntickInterval 10minute\nsection Section\n" + ret
  };
  reader.readAsText(file);
};


function convert2mermaid(stringLine) {
  // 行頭のトークンで処理を場合分け
  const token = stringLine.slice(0, 2);
  switch (token) {
    case "--":
      // --を含む場合->時間を取得
      let currentSchedule = stringLine.replace(/-/g, '')
      // previousTimeからの経過時間を算定
      if (!previousTime) {
        previousTime = currentSchedule;
        // milestoneを作成
        ret += `Start task0 : milestone, task0, ${currentSchedule.slice(0, 2) + ":" + currentSchedule.slice(2)},2m \n`
        return;
      }
      duration = calculateTimeDifference(previousTime, currentSchedule);
      previousTime = currentSchedule;
      ret += `${contentBuffer}: task${taskAlias += 1},after task${taskAlias - 1},${duration}m \n`
      break;

    case "**":
      ret += `${contentBuffer}: task${taskAlias += 1},after task${taskAlias - 1},${duration}m \n`
      console.log(`%cpreviousTime:${previousTime}`, 'color:red');
      ret += `Final milestone : milestone, taskZ,${previousTime.slice(0, 2) + ":" + previousTime.slice(2)},2m \n`
      break;

    default:
      if (stringLine) {

        // 作業内容をストアする
        contentBuffer = stringLine;
        console.log(contentBuffer);
        // 皿洗い:wash,12:45,10m
      }
      break;
  }
}

// 経過時間を取得
function calculateTimeDifference(time1, time2) {
  const hours1 = parseInt(time1.substring(0, 2));
  const minutes1 = parseInt(time1.substring(2, 4));

  const hours2 = parseInt(time2.substring(0, 2));
  const minutes2 = parseInt(time2.substring(2, 4));

  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;

  const difference = Math.abs(totalMinutes2 - totalMinutes1);

  return difference;
}

