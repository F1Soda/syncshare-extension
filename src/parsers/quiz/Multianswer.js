import Question from "Parsers/quiz/Question"
import * as Images from "Utils/images"
import * as Strings from "Utils/strings";
import createMagicButton from "Widgets/MagicButton"

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
        for (const input of edits) {
            this.edit[getSlot(input)] = { input };
        }

        /* Multichoice subquestion type */
        for (const mc of multichoices) {
            const inputs = mc.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

            const subQ = {
                options: {},
                answer: mc,
                type: inputs[0].type,
            }

            for (const input of inputs) {
                const label = input.nextSibling;

                const sign = [
                    Strings.removeInvisible(label.lastChild.textContent),
                    Images.serializeArray(label.querySelectorAll("img"))
                ];                  
    
                subQ.options[sign.join(";")] = input;
            }

            this.multichoice[getSlot(inputs[0])] = subQ;
        }

        /* Gap select subquestion type */
        for (const select of selects) {
            const subQ = {
                node: select,
                optionMap: {}
            }

            for (const option of select.childNodes) {
                if (!option.value)
                    continue;

                subQ.optionMap[option.innerText] = Strings.removeInvisible(option.value);
            }

            this.select[getSlot(select)] = subQ;
        }
    }

    createWidgetAnchor(anchor) {
        let subq = null;

        if ((subq = this.select[anchor.index])) {
            const button = createMagicButton();
            subq.node.parentNode.appendChild(button);

            const onClick = (data) => {
                let option = subq.optionMap[data.sign];

                // Try to find similar options in case 
                // the text of the question has changed
                if (!option) {
                    const candidate = Strings.findSimilar(data.sign, Object.keys(subq.optionMap));
    
                    if (!candidate) {
                        return;
                    }
    
                    option = subq.optionMap[candidate];
                }

                subq.node.value = option;
            }

            return { onClick, button };
        }
        else if ((subq = this.multichoice[anchor.index])) {

            if ("radio" === subq.type) {
                const button = createMagicButton();
                subq.answer.appendChild(button);

                const onClick = (data) => {
                    let choice = subq.options[data.sign];

                    // Try to find similar nodes in case 
                    // the text of the question has changed
                    if (!choice) {
                        const candidate = Strings.findSimilar(data.sign, Object.keys(subq.options));

                        if (!candidate) {
                            return;
                        }

                        choice = subq.options[candidate];
                    }
    
                    choice.checked = true;
                }

                return { onClick, button };
            }
            
            if ("checkbox" === subq.type) {
                let choice = subq.options[anchor.sign];

                // Try to find similar nodes in case 
                // the text of the question has changed
                if (!choice) {
                    const candiate = Strings.findSimilar(anchor.signature, Object.keys(subq.options));

                    if (!candiate) {
                        return;
                    }

                    choice = subq.options[candiate];
                }
    
                const button = createMagicButton();
                choice.parentNode.insertBefore(button, choice.nextSibling);
                const onClick = data => choice.checked = data.checked;
    
                return { onClick, button };
            }

        }
        else if ((subq = this.edit[anchor.index])) {
            const button = createMagicButton();
            subq.input.parentNode.appendChild(button);

            const onClick = (value) => {
                subq.input.value = value.text;
            }

            return { onClick, button };
        }
    }
}

export default Multianswer;