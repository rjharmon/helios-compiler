import { CompilerError } from "@helios-lang/compiler-utils"
import { Scope } from "../scopes/index.js"
import { IteratorType$ } from "../typecheck/index.js"
import { Expr } from "./Expr.js"

/**
 * @typedef {import("@helios-lang/compiler-utils").Site} Site
 * @typedef {import("../typecheck/index.js").EvalEntity} EvalEntity
 */

/**
 * Iterator[Type1, ...] expr
 */
export class IteratorTypeExpr extends Expr {
    #itemTypeExprs

    /**
     * @param {Site} site
     * @param {Expr[]} itemTypeExprs
     */
    constructor(site, itemTypeExprs) {
        super(site)

        this.#itemTypeExprs = itemTypeExprs
    }

    /**
     * @param {Scope} scope
     * @returns {EvalEntity}
     */
    evalInternal(scope) {
        const itemTypes = this.#itemTypeExprs.map((ite) => {
            const ite_ = ite.eval(scope)

            const itemType = ite_.asType

            if (!itemType) {
                throw CompilerError.type(ite.site, "not a type")
            }

            return itemType
        })

        if (itemTypes.length > 10) {
            throw CompilerError.type(
                this.site,
                "too many Iterator type args (limited to 10)"
            )
        }

        return IteratorType$(itemTypes)
    }

    /**
     * @returns {string}
     */
    toString() {
        return `Iterator[${this.#itemTypeExprs.map((ite) => ite.toString()).join(", ")}]`
    }
}
