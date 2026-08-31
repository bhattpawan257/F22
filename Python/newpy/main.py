import random,csv
scoreList=[10000,9000,7500,5000,2500,1000,750,500,250,100,50,10,0]
def game(key):
    global cheat
    nguess=1
    cheat=0
    while nguess<=12:
        userGuess=guess(nguess,key)
        positional=contains=0
        for i in range(len(userGuess)):
            if userGuess[i] in key:
                if userGuess[i] == key[i]:
                    positional+=1
                else:
                    contains+=1
        print("positional=",positional," contains=",contains)
        if positional==len(key):
            print("victory")
            print(key)
            break
        nguess+=1
    else:
        print("defeat")
        print(key)
    return nguess

    
def guess(guessno,key):
	global cheat
	while True:
		guess=input("guess no {} :".format(guessno))
		if len(guess) != len(key):
			print("guess should be {} long".format(len(key)))
		elif guess[0] not in "1234567890":
			print("only numbers allowed")
		elif guess=="1end"+"z"*(len(key)-4):
			cheat=1
			return key
		else :
			return guess

            
def generateKey(length,easyMode):
    numList=list("1234567890")
    if easyMode:
        chlist=[numList[i] for i in range(length)]
    else:
        chlist=numList
    key=""
    while len(key)<length:
        i=random.randint(0,len(chlist)-1)
        if chlist[i] not in key:
            key+=chlist[i]
        else:
            continue
    return key


def appendScore(length,score,easyMode):
    scoreFile=open("scoreFile.csv","r+")
    readObj=csv.reader(scoreFile)
    for i in readObj:
        if length==i[0] and i[1]==easyMode:
            i.append[score]
        if max(i)< score:
            print("new high score {} in {} length\
                easyMode:{}".format(score,length,easyMode))
    else:
        readObj.append[length,easyMode,score]
    

    
def main():
    length=int(input("enter length of key :"))
    easyMode=input("easy mode y/n: ")
    if easyMode in "yY":
        easyMode=True
    else:
        easyMode=False
    key = generateKey(length,easyMode)
    scoreKey=game(key)
    score=scoreList[scoreKey-1]
    print("score=",score)
    if not cheat:
        appendScore(length,score,easyMode)
    choice=input("play again y/n")
    if choice in "yY":
        main()
        
main()