import Question from "Parsers/quiz/Question"
import ssdeep from "Utils/ssdeep"
import * as Image from "Utils/images"
import * as Array from "Utils/arrays"
import { removeInvisible } from "Utils/strings";

class Multianswer extends Question {

    constructor(args) {
        super(args);

        const edits        = this.container.querySelectorAll("span.subquestion > input");
        const selects      = this.container.querySelectorAll("span.subquestion > select");
        const multichoices = this.container.querySelectorAll("div.answer, table.answer");

        const getSlot = node => node.name.match(/sub\d{1,}/)[0];

        this.edit        = {};
        this.select      = {};
        this.multichoice = {};    

        /* Shortanswer & numerical subquestion type */
        Array.forEach(edits, node => this.edit[getSlot(node)] = { node });

        /* Multichoice subquestion type */
        Array.forEach(multichoices, mc => {
            const inputs = mc.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

            const subQ = {
                options: {},
                answer: mc,
                type: inputs[0].type,
            }

            Array.forEach(inputs, input => {
                const label = input.nextSibling;

                let meta = removeInvisible(label.lastChild.textContent);

                Array.forEach(label.querySelectorAll("img"), image => {
                    meta += Image.serialize(image);
                });                    
    
                subQ.options[ssdeep.digest(meta)] = input;
            });

            this.multichoice[getSlot(inputs[0])] = subQ;
        });

        /* Gap select subquestion type */
        Array.forEach(selects, select => {
            const subQ = {
                node: select,
                optionMap: {}
            }

            for (const option of select.childNodes) {
                if (!option.value)
                    continue;

                subQ.optionMap[option.innerText] = removeInvisible(option.value);
            }

            this.select[getSlot(select)] = subQ;
        });
    }

    /*createWidgetAnchor(anchor) {
        const subq = this.struct[attachTo.slot];

        if (!subq)
            return null;

        if (subq.type === this.types.combo) {
            let btn = findMagicButton(subq.select.parentNode);

            if (!btn) {
                btn = createMagicButton();
                subq.select.parentNode.appendChild(btn);
            }

            const onClick = (value) => {
                subq.select.value = subq.rchoices[value.text];
            }

            return { onClick, button: btn }
        }
        else if (subq.type === this.types.radio) {
            let btn = findMagicButton(subq.base)

            if (!btn) {
                btn = createMagicButton();
                subq.base.appendChild(btn);
            }

            //const choice = findAppropriate(attachTo, subq.choices);

            const onClick = (value) => {
                const choice = this.attachMap[value.uuid];

                if (choice)
                    choice.input.checked = true;
            }

            return { onClick, button: btn }
        }
        else if (subq.type === this.types.check) {
            const choice = findAppropriate(attachTo, subq.choices);

            if (!choice)
                return null;

            let btn = findMagicButton(choice.input.parentNode);

            if (!btn) {
                btn = createMagicButton();
                choice.input.parentNode.appendChild(btn);
            }

            const onClick = (value) => {
                choice.input.checked = value.checked;
            }

            return { onClick, button: btn }
        }
        else if (subq.type === this.types.edit) {
            let btn = findMagicButton(subq.input.parentNode);

            if (!btn) {
                btn = createMagicButton();
                subq.input.parentNode.appendChild(btn);
            }

            const onClick = (value) => {
                subq.input.value = value.text;
            }

            return { onClick, button: btn }
        }
    }*/
}

export default Multianswer;