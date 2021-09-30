// import {camelCase} from 'lodash';
// console.log(camelCase('Hello World'))

const { ConsentString } = require('consent-string')
const consentData = new ConsentString('BOQ7WlgOQ7WlgABABwAAABJOACgACAAQABA')
console.log('consentData:', consentData)
// `consentData` contains the decoded consent information

const consentMP = new ConsentString('CPNWFJNPNWFJNE0ACCNLBiCgAAAAAAAAABpYAAAAAAAA.YAAAAAAAAYAA')
console.log('MpTCString', 'constentMP');

CPNWFJNPNWFJNE0ACCNLBiCgAAAAAAAAABpYAAAAAAAA.YAAAAAAAAYAA
CPNWFJNPNWFJNE0ACCNLBiCgAAAAAAAAABpYAAAAAAAA.YAAAAAAAAYAA