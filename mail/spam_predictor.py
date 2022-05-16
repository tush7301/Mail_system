import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle
from sklearn.model_selection import train_test_split

def make_model():
    df= pd.read_csv("mail/spam_ham_dataset.csv")
    df_data = df[["text","label_num"]]
    # Features and Labels
    df_x = df_data['text']
    df_y = df_data.label_num
    # Extract Feature With CountVectorizer
    corpus = df_x
    cv = CountVectorizer()
    X = cv.fit_transform(corpus) # Fit the Data
    X_train, X_test, y_train, y_test = train_test_split(X, df_y, test_size=0.33, random_state=42)
    #Naive Bayes Classifier
    nb = MultinomialNB()
    nb.fit(X_train,y_train)
    print(nb.score(X_test,y_test))
    with open('mail/SpamClassifier','wb') as f:
        pickle.dump((nb,cv),f)

def classify(data):
    with open('mail/SpamClassifier','rb') as f:
        nb,cv=pickle.load(f)
        vect=cv.transform([data]).toarray()
        prediction=nb.predict(vect)
        return prediction