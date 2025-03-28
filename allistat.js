//main code START

function prepareDeltaSpan(n) {
// given a number returns a span element with a space in front, +/- sign and a style
  let style = n > 0 ? "green" : "red";
  let txt = (n > 0 ? " +" : " ") + n.toString();
  let span = document.createElement("span", { style: "color:" + style } );
  span.style.color = (n > 0 ? "green" : "red");
  span.appendChild(document.createTextNode(txt));

  return span;
}

// given a table insert the headers row
// two variants for the two table types
function prepareOutTable(tab) {
  let row = tab.insertRow();
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('Date'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('HF'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('Tech'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('Anth'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('members'));
}
function prepareColoTable(tab) {
  let row = tab.insertRow();
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('Rank'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('Name'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('Grade'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('HF'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('Tech'));
  row.appendChild(document.createElement("th")).appendChild(document.createTextNode('Anth'));
}

function toggleRowVisibility(rid) {
  let row=document.querySelector('#' + rid);
  row.style.visibility = row.style.visibility == 'visible' ? 'collapse' : 'visible';
}

document.querySelector('#format').addEventListener('click', () => {

  let post = document.querySelector('#input').value.split(/\nDeleteModify/);
  let outTable = document.querySelector('#output');
  outTable.border = 2;
  prepareOutTable(outTable);


  // grab the two lines before 'deletemodify' separator 
  let last = post.shift().split(/\r?\n/);

  let ocolo=new Map(), stat, ostat, postn=0;
  let thf=0, members=0, ttech=0, tanth=0;

  // foreach post
  post.map(p => {
    const lines = p.split(/\r?\n/);

    postn++;

    // the row of totals
    let postRow = outTable.insertRow();
    let postRowId = 'tab' + postn;
    postRow.addEventListener('click', () => { toggleRowVisibility(postRowId) });

    // the colony details table
    let coloTable = document.createElement('table');
    coloTable.border=1;
    prepareColoTable(coloTable);

    stat = {
      thf:0,
      ttech:0,
      tanth:0,
      members:0
    };

    let members=0;
    const poster = last[ last.length - 2 ];
    let tstamp = last[ last.length - 1];
//console.log(`${p}\n${tstamp}\n}`);

    let [d, mon, day, year, hou, min, ampm] =  tstamp.match(/^(...) ([0-9]+) ([0-9]+)?[ ]?at ([0-9]+):([0-9]+) ([ap]m)$/);

    hou=Number(hou);
    if (hou == 12) { hou == 0; }
    if (ampm == 'pm') { hou += 12; }
    day = String(day).padStart(2,'0');
    hou = String(hou).padStart(2,'0');
    let ystr = year ? year + ' ' : '';
    tstamp = `${mon} ${day} ${ystr}at ${hou}:${min}`;
console.log(`${tstamp}`);

    thf=0, members=0, ttech=0, tanth=0;
   
    // foreach line
    lines.map(l => {
      // cleanup
      l = l.replace(/(Attack|Dégâts en (attaque|défense) : )/g, '');
      //l = l.replace(/Dégâts en attaque : /,l);

      // skip if not a member line 
      if (! RegExp(/^\d\d? .*( \d+)*$/).test(l)) {
        return;
      }

      coloRow = coloTable.insertRow();

      // grab the last part of line, made of just digits and spaces (hf tech anth)
      let [end] = l.match(/([ 0-9]*)$/);
      // grap the first part of the line (rank role name)
      let begin = l.substring(0, l.indexOf(end));

      let d,d1,d2, n, role, name, hf, tech, anth;
      d = begin.match(/^([0-9][0-9]?) (.*) ([^ ]*)$/);
      if (d) {
        [d1, n, role, name] = d;
      }
      d = end.match(/ ([0-9 ]+) ([0-9]+) ([0-9]+)$/);
      if (d) {
        [d2, hf, tech, anth] = end.match(/ ([0-9 ]+) ([0-9]+) ([0-9]+)$/);
        hf=Number(hf.replace(/\s+/g,''));
      }

      let data = {
          rank: n,
	  role: role,
	  hf: hf,
	  tech: tech,
	  anth: anth
        };
      let odata = ocolo.get(name);
      if (!odata) {
        // data is equal the old if this is the first post
	odata = data;
      }

      // add cells to the colony details row
      let cell;
      (cell = coloRow.insertCell()).appendChild(document.createTextNode(n));
      if (n - odata.rank != 0) {
        cell.appendChild(prepareDeltaSpan(n - odata.rank));
      }
      (cell = coloRow.insertCell()).appendChild(document.createTextNode(name));
      (cell = coloRow.insertCell()).appendChild(document.createTextNode(role));
      if (role != odata.role) {
        cell.appendChild(prepareDeltaSpan("new"));
      }
      (cell = coloRow.insertCell()).appendChild(document.createTextNode(hf));
      if (hf - odata.hf) {
        cell.appendChild(prepareDeltaSpan(hf - odata.hf));
      }
      (cell = coloRow.insertCell()).appendChild(document.createTextNode(tech));
      if (tech != odata.tech != 0) {
        cell.appendChild(prepareDeltaSpan(tech - odata.tech));
      }
      (cell = coloRow.insertCell()).appendChild(document.createTextNode(anth));
      if (anth - odata.anth != 0) {
        cell.appendChild(prepareDeltaSpan(anth - odata.anth));
      }


        //console.log(`${n} (${n-odata.rank}), ${role}, ${name}, ${hf} (${hf-odata.hf}), ${tech} (${tech-odata.tech}), ${anth} (${anth-odata.anth})\n`);

      stat.members++;
      stat.thf += hf;
      stat.ttech += Number(tech);
      stat.tanth += Number(anth);

      ocolo.set(name, data);

    }); // lines.map()


    if (!ostat) {
      ostat=stat;
    }
    let cell;
    (cell = postRow.insertCell()).appendChild(document.createTextNode(tstamp));
    (cell = postRow.insertCell()).appendChild(document.createTextNode(stat.thf));
    if (stat.thf - ostat.thf != 0) {
      cell.appendChild(prepareDeltaSpan(stat.thf - ostat.thf));
    }

    (cell = postRow.insertCell()).appendChild(document.createTextNode(stat.ttech));
    if (stat.ttech - ostat.ttech != 0) {
      cell.appendChild(prepareDeltaSpan(stat.ttech - ostat.ttech));
    }

    (cell = postRow.insertCell()).appendChild(document.createTextNode(stat.tanth));
    if (stat.tanth - ostat.tanth != 0) {
      cell.appendChild(prepareDeltaSpan(stat.tanth - ostat.tanth));
    }

    (cell = postRow.insertCell()).appendChild(document.createTextNode(stat.members));
    if (stat.members - ostat.members != 0) {
      cell.appendChild(prepareDeltaSpan(stat.members - ostat.members));
    }

    
    // new row with single cell with the colonies detail table inside
    postRow = outTable.insertRow();
    postRow.id = postRowId;
    postRow.style.visibility = 'collapse';
    cell = postRow.insertCell();
    cell.colSpan = 5;
    cell.appendChild(coloTable);


    // save data for comparison on next post
    ostat=stat;
    last = lines;

  }); // post.map()


});

