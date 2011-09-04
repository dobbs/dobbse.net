from org import drools

class ObjectType(drools.spi.ObjectType):
    def __init__(self, clazz):
        self.clazz = clazz
    def matches(self, o):
        return isinstance(o, self.clazz)

class Condition(drools.spi.Condition):
    def __init__(self, decls, fn):
        self.decls = decls
        self.fn = fn
    def getRequiredTupleMembers(self):
        return self.decls
    def isAllowed(self, tuple):
        return apply(self.fn, [tuple.get(d) for d in self.decls])

class Consequence(drools.spi.Consequence):
    def __init__(self, decls, fn):
        self.decls = decls
        self.fn = fn
    def invoke(self, tuple):
        workingMemory = tuple.getWorkingMemory()
        params = [workingMemory]
        params.extend([tuple.get(d) for d in self.decls])
        apply(self.fn, params)

def _rule(o):
    r = drools.rule.Rule(o.__class__.__name__)
    if hasattr(o, 'salience'):
        r.setSalience(o.salience)
    decls = [r.addParameterDeclaration(name, ObjectType(clazz))
             for (name, clazz) in o.parameters]
    for fn in _conditions(o):
        r.addCondition(Condition(decls, fn))
    r.setConsequence(Consequence(decls, o.consequence))
    return r

def _conditions(o):
    return [vars(o)[fn] for fn in dir(o) if fn.startswith('condition')]

def newWorkingMemory(name, rules):
    ruleset = drools.rule.RuleSet(name)
    for o in rules:
        ruleset.addRule(_rule(o))
    builder = drools.RuleBaseBuilder()
    builder.addRuleSet(ruleset)
    builder.setConflictResolver(drools.conflict.SalienceConflictResolver())
    rulebase = builder.build()
    workingMemory = rulebase.newWorkingMemory()
    return workingMemory

# Copyright (c) 2005  Eric Dobbs  Some rights reserved.
#
# This work is licensed under the Creative Commons Attribution
# License. To view a copy of this license, visit
# http://creativecommons.org/licenses/by/2.0/ or send a letter to
# Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305,
# USA.
