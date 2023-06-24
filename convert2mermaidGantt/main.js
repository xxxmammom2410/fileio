let ret = "";
let previousTime = ""
let duration = 0;
let taskAlias = 0;
let contentBuffer = ""

const convertedText = document.querySelector('#convertedText');
const plainText = document.querySelector('#plainText')
const convertBtn = document.querySelector('#convertPlainTxt');

const doneCheck = document.querySelector('#isDone');

convertBtn.addEventListener('click', () => {
  ret = '';
  taskAlias = 0;
  previousTime = '';
  let lines = plainText.value.split(/\r\n|\n/);
  for (let line = 0; line < lines.length; line++) {
    convert2mermaid(lines[line]);
  }
  intoConvertedText();
})


document.getElementById('file').onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let lines = this.result.split(/\r\n|\n/);
    for (let line = 0; line < lines.length; line++) {
      convert2mermaid(lines[line]);
    }
    intoConvertedText();
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
      addSchedule();
      break;

    case "**":
      addSchedule();
      console.log(`%cpreviousTime:${previousTime}`, 'color:red');
      addSchedule("Final milestone")
      break;

    default:
      if (stringLine) {
        // 作業内容をストアする
        contentBuffer = stringLine;
        console.log(contentBuffer);
      }
      break;
  }
}

function addSchedule(schedule = contentBuffer) {
  ret += schedule + ":";
  doneCheck.checked&&(ret+="done,");
  (schedule!==contentBuffer)&&(ret+="milestone,");
  ret += `task${taskAlias += 1},after task${taskAlias - 1},${(schedule!==contentBuffer)?2:duration}m \n`;
}

function intoConvertedText() {
  convertedText.value = `gantt\n   title ${doneCheck.checked ? "Done To Do" : "Planning To Do"}\n  	dateFormat HH:mm\n	axisFormat %H:%M\ntickInterval 10minute\nsection Section\n` + ret
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