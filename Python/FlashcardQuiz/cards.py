
class FlashCard:
    def __init__(self, ques, ans, options):
        self.ques=ques
        self.ans=ans
        self.options=options

    def isAns(self, ans):
        anop=""
        for i in self.options:
            cop=i.lower().partition(" ")
            if self.ans.lower() in cop:
                anop=cop
        if ans.lower() in (anop[0].lower(),anop[2].lower().strip()):
            return True
        else:
            return False
        

    
    
    
    
    