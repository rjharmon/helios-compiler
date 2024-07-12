import {
    ErrorCollector,
    Group,
    StringLiteral,
    TokenReader
} from "@helios-lang/compiler-utils"
import { None } from "@helios-lang/type-utils"

/**
 * @typedef {import("@helios-lang/compiler-utils").Site} Site
 */

/**
 * @typedef {(path: StringLiteral) => Option<string>} ImportPathTranslator
 */

/**
 * @typedef {{
 *   currentSite?: Site
 *   importPathTranslator?: Option<ImportPathTranslator>
 * }} ParseContextOptions
 */

export class ParseContext {
    /**
     * @readonly
     * @type {TokenReader}
     */
    reader

    /**
     * @readonly
     * @type {Site}
     */
    currentSite

    /**
     * @readonly
     * @type {Option<ImportPathTranslator>}
     */
    importPathTranslator

    /**
     * @param {TokenReader} reader
     * @param {ParseContextOptions} options
     */
    constructor(reader, options = {}) {
        this.reader = reader
        this.currentSite = options.currentSite ?? reader.tokens[0].site
        this.importPathTranslator = options.importPathTranslator
    }

    /**
     * @type {ErrorCollector}
     */
    get errors() {
        return this.reader.errors
    }

    /**
     * @param {Site} site
     * @returns {ParseContext}
     */
    atSite(site) {
        return new ParseContext(this.reader, {
            currentSite: site,
            importPathTranslator: this.importPathTranslator
        })
    }

    /**
     * @param {Group<TokenReader>} group
     * @param {number} fieldIndex
     * @returns {ParseContext}
     */
    inGroup(group, fieldIndex = 0) {
        return this.atSite(group.site).withReader(group.fields[fieldIndex])
    }

    /**
     * @param {TokenReader} r
     * @returns {ParseContext}
     */
    withReader(r) {
        return new ParseContext(r, {
            currentSite: this.currentSite,
            importPathTranslator: this.importPathTranslator
        })
    }
}
