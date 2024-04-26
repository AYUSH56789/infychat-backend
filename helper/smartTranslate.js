import translate from "translate";
async function translateResponse(text,translateTo){
    translate.engine="libre";
    const foo=await translate(text,translateTo);
    console.log(foo);
}

translateResponse("hlo ayush","es")