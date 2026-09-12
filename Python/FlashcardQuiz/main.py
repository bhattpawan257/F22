from cards import *
import random,os


def rlst(n,rn):
    rls=[]
    for i in range(n):
        rls.append(random.randint(0,rn))
    return rls


def sepQues(lst):
    ql=[]
    l=[]
    op=[]
    s=0
    for i in lst:
        if i=="\n":
            l.append(op)
            ql.append(l)
            s=0
            op=[]
            l=[]
        elif i[0]=="^":
            l.append(i)
            s=1
        elif s:
            op.append(i)
        else:
            l.append(i)
    return ql


def chooseTheme():
    print("choose your theme")
    thmls=os.listdir("categories")
    for i in range(len(thmls)):
        print(i+1,thmls[i].split(".")[0])
    while True:
        ch=input("Enter your Choice: ")
        if ch.isdigit() and int(ch) in range(1,23):
            return thmls[int(ch)-1]
        if ch in thmls:
            return ch
        else:
            input("Invalid Choice")
    

def createCards(theme,nques):
    with open(f"categories/{theme}","r",encoding="latin-1") as fh:
        lines=fh.readlines()
    qslst=sepQues(lines)
    tques=len(qslst)
    rls=rlst(nques,tques)
    qlst=[]
    for i in rls:
        qlst.append(FlashCard(qslst[i][0],qslst[i][1][2:].lower(),qslst[i][2]))
    return qlst


def playQuiz(qlst):
    score=0
    als=[]
    for i in qlst:
        print(i.ques)
        for j in i.options:
            print(j)
        ans=input("answer: ")          
        if i.isAns(ans):
            score+=1
            als.append("✓")
        else:
            als.append("✗")
    return score,als


def main():
    ch="y"
    while ch in "yY":
        n=int(input("enter no of ques: "))
        thm=chooseTheme()
        qls=createCards(thm,n)
        scr=playQuiz(qls)
        print("correct answers: ")
        for i in range(len(qls)):
            print(i+1,qls[i].ans.strip(),scr[1][i])
        print(f"score: {scr[0]}")
        ch=input("play again(y/n): ")


if __name__ == "__main__":
    main()