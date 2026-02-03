// import Prism from 'prismjs'

// Minimal Prism definition for Microsoft AL language
// Covers: keywords, types, comments, strings, numbers, attributes, annotations

// const keywords = [
//   'table','tableextension','page','pageextension','report','reportextension','xlsx','query','xmlport',
//   'enum','enumextension','interface','codeunit','controladdin','profile','permissionset','permissionsetextension',
//   'dotnet','label','trigger','procedure','local','internal','external','event','subscriber','with',
//   'var','begin','end','if','then','else','case','of','while','do','repeat','until','for','to','downto','exit',
//   'try','catch','finally','throws','return','tmp','temporary','extends','implements'
// ]

// const types = [
//   'Integer','BigInteger','Decimal','Boolean','Char','Text','Code','Guid','Option','Date','Time','DateTime','Duration',
//   'Record','Page','Report','XmlPort','Query','Codeunit','Enum','Interface','List','Dictionary','Array','JsonObject','JsonArray','JsonToken','HttpClient','HttpResponseMessage','HttpContent'
// ]

// Prism.languages.al = Prism.languages.al || {
//   'comment': [/\/\/.*(?:\n|$)/, /\/\*[\s\S]*?\*\//],
//   'string': {
//     pattern: /'(?:''|[^'])*'|"(?:""|[^"])*"/,
//     greedy: true
//   },
//   'number': /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?)\b/,
//   'keyword': new RegExp('\\b(?:' + keywords.join('|') + ')\\b', 'i'),
//   'type': new RegExp('\\b(?:' + types.join('|') + ')\\b'),
//   'annotation': {
//     pattern: /\[(?:InDataSet|Obsolete|Scope|TryFunction|Test|TestFail|NonDebuggable|ServiceEnabled)\b[^\]]*\]/,
//     alias: 'attr-name'
//   },
//   'property': /\b(?:Caption|Description|ApplicationArea|UsageCategory|Image|Promoted|PromotedCategory|Visible|Enabled|Editable|DataClassification)\b/,
//   'operator': /[:+\-*/=<>]|::|\.|\,|;|\(|\)|\{|\}|\[|\]/,
//   'punctuation': /[{}[\];(),.:]/
// }
