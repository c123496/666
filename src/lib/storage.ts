import { Conversation, Message, PersonalityType, UserConfig, UserMemory } from './types';

const STORAGE_KEYS = {
  USER_CONFIG: 'virtual-boyfriend-user-config',
  CONVERSATIONS: 'virtual-boyfriend-conversations',
  USER_MEMORY: 'virtual-boyfriend-user-memory',
};

function getDefaultUserConfig(): UserConfig {
  return {
    nickname: '',
    personalityId: null,
    conversationId: null,
    lastVisit: Date.now(),
  };
}

function getDefaultUserMemory(): UserMemory {
  return {
    keyEvents: [],
    preferences: [],
    relationshipMilestones: [],
  };
}

function safeReadStorage(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}"`, error);
    return null;
  }
}

function safeWriteStorage(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}"`, error);
  }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}"`, error);
  }
}

function safeParseJson<T>(raw: string | null, fallback: T, key: string): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}"`, error);
    safeRemoveStorage(key);
    return fallback;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class UserConfigManager {
  private static getConfig(): UserConfig {
    if (typeof window === 'undefined') {
      return getDefaultUserConfig();
    }

    const stored = safeReadStorage(STORAGE_KEYS.USER_CONFIG);
    if (!stored) {
      const defaultConfig = getDefaultUserConfig();
      safeWriteStorage(STORAGE_KEYS.USER_CONFIG, JSON.stringify(defaultConfig));
      return defaultConfig;
    }

    return safeParseJson(stored, getDefaultUserConfig(), STORAGE_KEYS.USER_CONFIG);
  }

  static getNickname(): string {
    return this.getConfig().nickname;
  }

  static setNickname(nickname: string): void {
    const config = this.getConfig();
    config.nickname = nickname;
    config.lastVisit = Date.now();
    safeWriteStorage(STORAGE_KEYS.USER_CONFIG, JSON.stringify(config));
  }

  static getPersonalityId(): PersonalityType | null {
    return this.getConfig().personalityId;
  }

  static setPersonalityId(personalityId: PersonalityType): void {
    const config = this.getConfig();
    config.personalityId = personalityId;
    config.lastVisit = Date.now();
    safeWriteStorage(STORAGE_KEYS.USER_CONFIG, JSON.stringify(config));
  }

  static getConversationId(): string | null {
    return this.getConfig().conversationId;
  }

  static setConversationId(conversationId: string): void {
    const config = this.getConfig();
    config.conversationId = conversationId;
    config.lastVisit = Date.now();
    safeWriteStorage(STORAGE_KEYS.USER_CONFIG, JSON.stringify(config));
  }

  static clearAll(): void {
    safeRemoveStorage(STORAGE_KEYS.USER_CONFIG);
    safeRemoveStorage(STORAGE_KEYS.CONVERSATIONS);
    safeRemoveStorage(STORAGE_KEYS.USER_MEMORY);
  }
}

export class ConversationManager {
  private static getConversations(): Map<string, Conversation> {
    if (typeof window === 'undefined') {
      return new Map();
    }

    const stored = safeReadStorage(STORAGE_KEYS.CONVERSATIONS);
    if (!stored) {
      return new Map();
    }

    const obj = safeParseJson<Record<string, Conversation>>(stored, {}, STORAGE_KEYS.CONVERSATIONS);
    return new Map(Object.entries(obj));
  }

  private static saveConversations(conversations: Map<string, Conversation>): void {
    const obj = Object.fromEntries(conversations);
    safeWriteStorage(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(obj));
  }

  static createConversation(personalityId: PersonalityType): Conversation {
    const conversations = this.getConversations();
    const conversation: Conversation = {
      id: generateId(),
      personalityId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    conversations.set(conversation.id, conversation);
    this.saveConversations(conversations);
    UserConfigManager.setConversationId(conversation.id);

    return conversation;
  }

  static getConversation(id: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.get(id) || null;
  }

  static getCurrentConversation(): Conversation | null {
    const conversationId = UserConfigManager.getConversationId();
    if (!conversationId) {
      return null;
    }

    return this.getConversation(conversationId);
  }

  static addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const conversations = this.getConversations();
    const conversation = conversations.get(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = Date.now();

    this.saveConversations(conversations);
    return newMessage;
  }

  static updateMessage(
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ): void {
    const conversations = this.getConversations();
    const conversation = conversations.get(conversationId);

    if (!conversation) {
      return;
    }

    const messageIndex = conversation.messages.findIndex((message) => message.id === messageId);
    if (messageIndex === -1) {
      return;
    }

    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      ...updates,
    };
    conversation.updatedAt = Date.now();

    this.saveConversations(conversations);
  }

  static clearConversation(conversationId: string): void {
    const conversations = this.getConversations();
    conversations.delete(conversationId);
    this.saveConversations(conversations);
  }

  static replaceMessage(
    conversationId: string,
    messageId: string,
    newMessage: Omit<Message, 'id' | 'timestamp'>
  ): void {
    const conversations = this.getConversations();
    const conversation = conversations.get(conversationId);

    if (!conversation) {
      return;
    }

    const messageIndex = conversation.messages.findIndex((message) => message.id === messageId);
    if (messageIndex === -1) {
      return;
    }

    conversation.messages[messageIndex] = {
      ...newMessage,
      id: messageId,
      timestamp: Date.now(),
    };
    conversation.updatedAt = Date.now();

    this.saveConversations(conversations);
  }

  static getConversationHistory(conversationId: string): Array<{
    role: 'user' | 'assistant';
    content: string;
  }> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return [];
    }

    return conversation.messages
      .filter((message) => message.type === 'text')
      .map((message) => ({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.content,
      }));
  }
}

export class UserMemoryManager {
  private static getMemory(): UserMemory {
    if (typeof window === 'undefined') {
      return getDefaultUserMemory();
    }

    const stored = safeReadStorage(STORAGE_KEYS.USER_MEMORY);
    if (!stored) {
      const defaultMemory = getDefaultUserMemory();
      safeWriteStorage(STORAGE_KEYS.USER_MEMORY, JSON.stringify(defaultMemory));
      return defaultMemory;
    }

    return safeParseJson(stored, getDefaultUserMemory(), STORAGE_KEYS.USER_MEMORY);
  }

  private static saveMemory(memory: UserMemory): void {
    safeWriteStorage(STORAGE_KEYS.USER_MEMORY, JSON.stringify(memory));
  }

  static addKeyEvent(event: string): void {
    const memory = this.getMemory();
    if (!memory.keyEvents.includes(event)) {
      memory.keyEvents.push(event);
      this.saveMemory(memory);
    }
  }

  static addPreference(preference: string): void {
    const memory = this.getMemory();
    if (!memory.preferences.includes(preference)) {
      memory.preferences.push(preference);
      this.saveMemory(memory);
    }
  }

  static addMilestone(milestone: string): void {
    const memory = this.getMemory();
    if (!memory.relationshipMilestones.includes(milestone)) {
      memory.relationshipMilestones.push(milestone);
      this.saveMemory(memory);
    }
  }

  static getMemorySummary(): string {
    const memory = this.getMemory();
    const parts: string[] = [];

    if (memory.keyEvents.length > 0) {
      parts.push(`关键事件：${memory.keyEvents.join('、')}`);
    }

    if (memory.preferences.length > 0) {
      parts.push(`用户偏好：${memory.preferences.join('、')}`);
    }

    if (memory.relationshipMilestones.length > 0) {
      parts.push(`关系里程碑：${memory.relationshipMilestones.join('、')}`);
    }

    return parts.join('\n');
  }
}
