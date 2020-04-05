class JSONReader {
    fileName: string;

    constructor(fileName: string) {
        this.fileName = fileName;
    }

    read(callback: (wd: WodzDisplayer, response: string) => void) {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.overrideMimeType("application/json");
        xmlhttp.open("GET", this.fileName, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
                // Reference to app instance.
                callback(app.getWodzDisplayer(), xmlhttp.responseText);
            }
        }
        xmlhttp.send(null);
    }
}

class Wod {
    name: string;
    structure : Structure;
    blocks : Array<Block>;

    constructor(name: string, blocks: Array<Block>) {
        this.name = name;
        this.blocks = blocks;
    }

    toString(): string {
        let str = "<span class=\"wod\">";
        str += "<h2>" + this.name + "</h2>";

        this.blocks.forEach(block => {
            str += block.toString();
        });

        str += "</span>";
        return str;
    }
}

class Structure {
    groups: Array<Group> = new Array<Group>();
}

class Group {
    repet: number;
    blocks: Array<Block> = new Array<Block>();
}

class Block {
    name: string;
    exercises: Array<Exercise>;

    constructor(name: string, exercises: Array<Exercise>) {
        this.name = name;
        this.exercises = exercises;
    }

    toString() {
        let str = "<span class=\"block\">";
        str += "<h3>" + this.name + "</h3>";

        str += "<ul>"
        this.exercises.forEach(ex => {
            str += "<li>"
            str += ex.toString();
            str += "</li>"
        });
        str += "</ul>"

        str += "</span>";
        return str;
    }
}

class Exercise {
    name: string;
    repetition: string;

    constructor(name: string, repetition: string) {
        this.name = name;
        this.repetition = repetition;
    }

    toString(): string {
        let str = "<span class=\"exercise\">";
        str += this.name;
        str += " (" + this.repetition + ")";
        str += "</span>";
        return str;
    }
}

class WodzDisplayer {

    private static readonly WODZ_DIV_ID = "wodz_page";
    private wodz: Array<Wod> = new Array<Wod>();
    private exercises: Array<Exercise> = new Array<Exercise>();

    public prepareData(data) {
        data.wodz.forEach(wod => {
            this.wodz.push(this.parseWod(wod));
        });
    }

    private parseWod(wod): Wod {
        let wodName: string = wod.wod_name;
        let blocks: Array<Block> = new Array<Block>();

        console.log(wod.wod_blocks);
        if (null != wod.wod_blocks) {
            wod.wod_blocks.forEach(block => {
                blocks.push(this.parseBlock(block));
            });
        }

        return new Wod(wodName, blocks);
    }

    private parseBlock(block): Block {
        let blockName: string = block.wod_block_name;
        let blockExercises: Array<Exercise> = new Array<Exercise>();

        if (null != block.wod_block_ex) {
            block.wod_block_ex.forEach(exercise => {
                blockExercises.push(this.parseExercise(exercise));
            });
        }

        return new Block(blockName, blockExercises);
    }

    private parseExercise(exercise): Exercise {
        return new Exercise(exercise.ex_name, exercise.ex_rep);
    }

    /*
     * Display the wod data in the HTML page.
     */
    public display() {
        let wodDiv: Element = document.getElementById(WodzDisplayer.WODZ_DIV_ID);
        wodDiv.innerHTML = this.generateWodzListHTML();
    }

    /*
     * Generate the HTML structure for the wodz data.
     */
    private generateWodzListHTML(): string {
        let wodzHTML: string = "";
        this.wodz.forEach(wod => {
            wodzHTML += wod.toString();
        });

        return wodzHTML;
    }
}

class App {

    private static readonly DB_FILE_PATH = "db/wodz.json";
    private wodzDisplayer: WodzDisplayer = new WodzDisplayer();

    public main() {
        this.readData();
    }

    public getWodzDisplayer(): WodzDisplayer {
        return this.wodzDisplayer;
    }

    /*
     * Read wodz object from json file.
     */
    private readData() {
        let reader: JSONReader = new JSONReader(App.DB_FILE_PATH);

        reader.read(function(wd: WodzDisplayer, response: string) {
            let data = JSON.parse(response);
            wd.prepareData(data);
            wd.display();
        });
    }
}

/*
 * Program entry point.
 */
let app: App = new App();
app.main();